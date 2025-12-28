# Explanation of the Noise Variance Detector

This document explains the mathematics and logic behind the `NoiseVarianceDetector` module in TrueTrace.

## 1. Goal: Detecting Splicing and Tampering

The primary goal of this detector is to identify image splicing, a common forgery technique where a part of one image is pasted onto another. When an area is manipulated (e.g., text is erased, a signature is moved), the natural noise pattern of the image is disturbed. This detector is designed to spot those disturbances.

## 2. The Role of the Laplacian Filter

Digital images are not perfectly smooth; they contain high-frequency noise, which is a natural result of the camera's sensor and the environment's lighting. This noise is usually invisible to the naked eye but is distributed fairly uniformly across an authentic image.

The **Laplacian filter** is a mathematical operator used in image processing to find areas of rapid intensity change. It's essentially a second-order derivative filter. When applied to an image, it highlights edges and other high-frequency details.

In our case, we use it to create a **noise map**. By applying the Laplacian filter, we strip away the low-frequency components (the actual content of the image, like shapes and colors) and are left with a representation of the high-frequency noise.

## 3. Logic: Why Divide the Image into Blocks?

A forged image might have a noise pattern that is consistent *within* the tampered region, but this region's noise will be inconsistent with the rest of the image.

To detect this, we can't just look at the average noise of the entire image. Instead, we use a **block-based approach**:

1.  The noise map is divided into a grid of smaller, non-overlapping blocks (e.g., 50x50 pixels).
2.  This allows us to perform a localized analysis. We assume that in an authentic image, every block should have a roughly similar amount of noise.

## 4. Variance: The Key to Finding Anomalies

For each block, we calculate the **variance** of the pixel intensity values.

**What is Variance?**
In statistics, variance measures how far a set of numbers is spread out from their average value.

-   **High Variance:** The pixel values in the block are widely spread. This means the block contains a lot of detail and texture (i.e., a healthy amount of natural noise).
-   **Low Variance:** The pixel values are very close to the average. This indicates a smooth, flat area with little texture.

**Why is Low Variance Suspicious?**
When a forger uses a tool like a "blur" or "smudge" brush to erase a detail or blend a pasted object, they are effectively smoothing out the pixels in that area. This process **destroys the natural high-frequency noise**.

As a result, a tampered block will have a significantly **lower noise variance** than the authentic, untouched blocks surrounding it.

**The Logic in Code:**
1.  We calculate the variance for every block in the noise map.
2.  We compute the **average variance** across all blocks. This gives us a baseline for what "normal" noise looks like in this specific image.
3.  We then iterate through each block again. If a block's variance is drastically lower than the average (e.g., less than 20% of the average), we flag it as a "Splicing Attempt".

This method is effective because it doesn't rely on a fixed threshold; it adapts to the unique noise profile of each image it analyzes.
