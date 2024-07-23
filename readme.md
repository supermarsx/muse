# _muse, Master userscript extended

This is an auxiliary library designed to be used by other userscripts. It provides various utility functions to enhance and simplify the development of userscripts.

## Installation

To use this library, include it in your userscript by adding the following lines to your script's metadata:

```javascript
// @require  https://raw.githubusercontent.com/supermarsx/muse/main/dist/_muse_.js
```

## Usage Examples

Here are some examples of how to use the functions provided by this library:

### Example 1: Checking if in an iframe
```javascript
if (_muse.Check.isIframe()) {
    console.log('This script is running inside an iframe');
}
```

### Example 2: Cloning an element
```javascript
const clone = _muse.Clone.element({ sourceSelector: '#example', destinationSelector: 'body' });
```

## Documentation
...

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Warranty
This software is provided "as-is," without any express or implied warranty. In no event shall the authors be held liable for any damages arising from the use of this software.
