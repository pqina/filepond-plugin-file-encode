// @ts-ignore
import { FilePondFile, FilePondOptions } from "filepond";

declare module "filepond" {
  export interface FilePondOptions {
    /** Enable or disable file encode. */
    allowFileEncode?: boolean;
  }

  export interface FilePondFile {
    getFileEncodeBase64String(): string;
    getFileEncodeDataURL(): string;
  }
}
