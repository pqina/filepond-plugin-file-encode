# File Encode plugin for FilePond

[![npm version](https://badge.fury.io/js/filepond-plugin-file-encode.svg)](https://badge.fury.io/js/filepond)

https://pqina.nl/filepond/docs/patterns/plugins/file-encode/

When submitting files along with a classic form post we run into a serious browser limitation. The file input field is the only field available to submit files to a server but its value can't be set. The file input field value can only be modified by the user, and only when a file is added manually (in one action).

The file encode plugin circumvents this by encoding files as base64 strings and adding those strings to hidden input fields. We can then decode the strings on the server to retrieve the original file object.

[Demo](https://pqina.github.io/filepond-plugin-file-encode/)
