declare module 'exif-parser' {
  interface Tags {
    Software?: string;
    CreateDate?: number;
    [key: string]: string | number | boolean | undefined;
  }

  interface ParsedData {
    tags: Tags;
    imageSize?: {
      width: number;
      height: number;
    };
    thumbnailOffset?: number;
    thumbnailLength?: number;
    thumbnailType?: number;
    app1Offset?: number;
  }

  interface Parser {
    parse(): ParsedData;
    enableSimpleValues(enable: boolean): Parser;
    enablePointers(enable: boolean): Parser;
    enableBinaryFields(enable: boolean): Parser;
  }

  interface ExifParserStatic {
    create(buffer: Buffer): Parser;
  }

  const ExifParser: ExifParserStatic;
  export default ExifParser;
}
