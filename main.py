
import sys

from rich.console import Console

from rich.table import Table

from PIL import Image, ImageChops, ImageEnhance, ExifTags

import numpy as np

import cv2



class MetadataDetector:

    def analyze(self, image_path):

        """

        Analyzes the image's metadata for signs of manipulation.

        """

        try:

            img = Image.open(image_path)

            exif_data = img._getexif()

        except Exception:

            return {

                "detector": "Metadata",

                "result": "Warning",

                "details": "Could not read image or extract EXIF data.",

                "score": 10,

            }



        if not exif_data:

            return {

                "detector": "Metadata",

                "result": "Warning",

                "details": "No EXIF metadata found. This could be a sign of tampering.",

                "score": 20,

            }



        exif = {

            ExifTags.TAGS[k]: v

            for k, v in exif_data.items()

            if k in ExifTags.TAGS

        }



        suspicious_software = ["photoshop", "gimp", "canva"]

        software = exif.get("Software", "").lower()

        creation_date = exif.get("DateTimeOriginal")



        warnings = []

        score = 0



        if any(s in software for s in suspicious_software):

            warnings.append(f"Image was edited with suspicious software: {software.title()}")

            score += 50

        

        if not creation_date:

            warnings.append("Original creation date is missing.")

            score += 30



        if warnings:

            return {

                "detector": "Metadata",

                "result": "Fail",

                "details": "\n".join(warnings),

                "score": min(100, score),

            }



        return {

            "detector": "Metadata",

            "result": "Pass",

            "details": "No suspicious metadata found.",

            "score": 0,

        }



class ELADetector:

    def __init__(self, quality=90, brightness_threshold=10):

        self.quality = quality

        self.brightness_threshold = brightness_threshold

        self.ela_image = None



    def analyze(self, image_path):

        """

        Performs Error Level Analysis (ELA) to find parts of an image with different compression levels.

        """

        try:

            original = Image.open(image_path).convert('RGB')

            

            # Resave the image at a specific quality

            temp_path = "temp_ela.jpg"

            original.save(temp_path, 'JPEG', quality=self.quality)

            resaved = Image.open(temp_path)



            # Find the difference

            self.ela_image = ImageChops.difference(original, resaved)

            

            # Enhance brightness

            extrema = self.ela_image.getextrema()

            max_diff = max([ex[1] for ex in extrema])

            if max_diff == 0:

                max_diff = 1

            scale = 255.0 / max_diff

            self.ela_image = ImageEnhance.Brightness(self.ela_image).enhance(scale)



            # Calculate brightness ratio

            ela_array = np.array(self.ela_image)

            brightness_ratio = np.mean(ela_array)



            if brightness_ratio > self.brightness_threshold:

                return {

                    "detector": "ELA",

                    "result": "Fail",

                    "details": f"High ELA brightness ratio: {brightness_ratio:.2f} (Threshold: {self.brightness_threshold}). Potential manipulation.",

                    "score": 75,

                }

            else:

                return {

                    "detector": "ELA",

                    "result": "Pass",

                    "details": f"ELA brightness ratio: {brightness_ratio:.2f} (Threshold: {self.brightness_threshold}).",

                    "score": 0,

                }



        except Exception as e:

            return {

                "detector": "ELA",

                "result": "Warning",

                "details": f"Could not perform ELA analysis: {e}",

                "score": 10,

            }



    def save_ela_image(self, path):

        if self.ela_image:

            self.ela_image.save(path)



class NoiseVarianceDetector:

    def __init__(self, block_size=50, variance_threshold_ratio=0.2):

        self.block_size = block_size

        self.variance_threshold_ratio = variance_threshold_ratio

        self.noise_map = None



    def analyze(self, image_path):

        """

        Analyzes the noise variance in blocks to detect inconsistencies.

        """

        try:

            img = cv2.imread(image_path)

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            

            # Apply Laplacian filter to get high-frequency noise

            laplacian = cv2.Laplacian(gray, cv2.CV_64F)

            self.noise_map = np.uint8(np.absolute(laplacian))



            # Divide into blocks and calculate variance

            variances = []

            for y in range(0, self.noise_map.shape[0] - self.block_size, self.block_size):

                for x in range(0, self.noise_map.shape[1] - self.block_size, self.block_size):

                    block = self.noise_map[y:y+self.block_size, x:x+self.block_size]

                    variances.append(np.var(block))

            

            if not variances:

                return {

                    "detector": "Noise Variance",

                    "result": "Warning",

                    "details": "Image is too small for block analysis.",

                    "score": 10,

                }



            avg_variance = np.mean(variances)

            threshold = avg_variance * self.variance_threshold_ratio

            

            suspicious_blocks = sum(1 for var in variances if var < threshold)



            if suspicious_blocks > 0:

                return {

                    "detector": "Noise Variance",

                    "result": "Fail",

                    "details": f"Found {suspicious_blocks} block(s) with significantly lower noise variance than average. Potential splicing.",

                    "score": 85,

                }

            else:

                return {

                    "detector": "Noise Variance",

                    "result": "Pass",

                    "details": "Noise variance is consistent across the image.",

                    "score": 0,

                }



        except Exception as e:

            return {

                "detector": "Noise Variance",

                "result": "Warning",

                "details": f"Could not perform noise variance analysis: {e}",

                "score": 10,

            }



    def get_noise_map(self):

        if self.noise_map is not None:

            return Image.fromarray(self.noise_map)

        return None



class DocumentAnalyzer:

    def __init__(self, image_path):

        self.image_path = image_path

        self.metadata_detector = MetadataDetector()

        self.ela_detector = ELADetector()

        self.noise_detector = NoiseVarianceDetector()

        self.detectors = [

            self.metadata_detector,

            self.ela_detector,

            self.noise_detector,

        ]



    def analyze(self):

        """

        Runs all detectors and aggregates the results.

        """

        results = []

        for detector in self.detectors:

            results.append(detector.analyze(self.image_path))



        # Calculate final score

        weights = {"Metadata": 0.2, "ELA": 0.4, "Noise Variance": 0.4}

        final_score = sum(

            res["score"] * weights[res["detector"]]

            for res in results

            if "score" in res and "detector" in res

        )

        

        self.save_debug_report()



        return results, final_score



    def save_debug_report(self):

        """

        Saves a debug image with ELA and Noise maps.

        """

        ela_img = self.ela_detector.ela_image

        noise_map_img = self.noise_detector.get_noise_map()



        if not ela_img or not noise_map_img:

            return



        # Resize to same height for side-by-side view

        h, w = ela_img.height, ela_img.width

        noise_map_img = noise_map_img.resize((w, h))



        debug_report = Image.new('RGB', (w * 2, h))

        debug_report.paste(ela_img, (0, 0))

        debug_report.paste(noise_map_img, (w, 0))

        debug_report.save("debug_report.jpg")





def main(image_path: str):

    """

    Analyzes a document for signs of forgery.

    """

    console = Console()

    console.print(f"[bold blue]Analyzing {image_path}...[/bold blue]")



    analyzer = DocumentAnalyzer(image_path)

    results, final_score = analyzer.analyze()



    table = Table(title="[bold]DocuVerify Pro Analysis Report[/bold]")

    table.add_column("Detector", style="cyan", no_wrap=True)

    table.add_column("Result", style="white")

    table.add_column("Details", style="yellow")



    result_styles = {

        "Pass": "[green]Pass[/green]",

        "Fail": "Fail",

        "Warning": "[yellow]Warning[/yellow]",

    }



    for res in results:

        result_style = result_styles.get(res["result"], res["result"])

        if res["result"] == "Fail":

            result_style = f"[red]{res['result']}[/red]"

        table.add_row(res["detector"], result_style, res["details"])



    console.print(table)

    console.print(f"\n[bold]Final Fake Probability Score: {final_score:.2f}%[/bold]")

    console.print("\n[green]Debug report saved to debug_report.jpg[/green]")





if __name__ == "__main__":

    if len(sys.argv) != 2:

        print("Usage: python main.py <image_path>")

        sys.exit(1)

    

    main(sys.argv[1])


