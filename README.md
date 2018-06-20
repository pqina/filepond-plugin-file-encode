# File Encode plugin for FilePond

[![npm version](https://badge.fury.io/js/filepond-plugin-file-encode.svg)](https://badge.fury.io/js/filepond)

https://pqina.nl/filepond

## Description
The File Encode plugin encodes a dropped file as a Base64 string and stores the string in a hidden input field as a JSON string. It uses a JSON string so it can also add the file size, type, name and metadata.

For more information, checkout [the documentation](https://pqina.nl/filepond/docs/patterns/plugins/file-encode/).

## Usage
Install using npm:

```
npm install filepond-plugin-file-encode
```

Then import and register in your project:

```javascript
import * as FilePond from 'filepond';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';

FilePond.registerPlugin(FilePondPluginFileEncode);
```

## License

**Please don't remove or change the disclaimers in the source files**

MIT License

Copyright (c) 2018 PQINA | [Rik Schennik](mailto:rik@pqina.nl)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
