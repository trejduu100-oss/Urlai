# URLAI Widget Documentation

The URLAI Widget allows you to embed URL shortening functionality directly into your website.

## Installation

Add this single line to your HTML file before the closing `</body>` tag:

\`\`\`html
<script src="https://urlai.vercel.app/urlai-widget.js"></script>
\`\`\`

## Usage Examples

### Method 1: Simple Button Widget

Add a container to your HTML where you want the widget to appear:

\`\`\`html
<div id="urlai-shortener"></div>

<script src="https://urlai.vercel.app/urlai-widget.js"></script>
<script>
  window.URLAIWidget.createButton('urlai-shortener');
</script>
\`\`\`

### Method 2: Programmatic API

Shorten URLs directly with JavaScript:

\`\`\`javascript
window.URLAIWidget.shorten({
  url: 'https://example.com/very-long-url',
  customCode: 'my-link', // optional
  onSuccess: function(result) {
    console.log('Shortened URL:', result.shortUrl);
    console.log('Short Code:', result.shortCode);
    console.log('Expires At:', result.expiresAt);
  },
  onError: function(error) {
    console.error('Error:', error);
  }
});
\`\`\`

## Options

### `shorten(options)`

- `url` (required): The URL to shorten
- `customCode` (optional): Custom short code instead of random
- `onSuccess` (optional): Callback function when successful
- `onError` (optional): Callback function if error occurs

### `createButton(containerId, options)`

- `containerId` (required): ID of HTML element to place widget in
- `options` (optional): Additional styling options (future enhancement)

## Examples

### Example 1: Basic Usage in HTML

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>My Website with URL Shortener</title>
</head>
<body>
  <h1>Welcome to My Site</h1>
  
  <div id="shortener"></div>
  
  <script src="https://urlai.vercel.app/urlai-widget.js"></script>
  <script>
    window.URLAIWidget.createButton('shortener');
  </script>
</body>
</html>
\`\`\`

### Example 2: Programmatic Integration

\`\`\`html
<button id="shorten-btn">Shorten This URL</button>
<div id="result"></div>

<script src="https://urlai.vercel.app/urlai-widget.js"></script>
<script>
  document.getElementById('shorten-btn').addEventListener('click', function() {
    const urlToShorten = 'https://my-long-url.example.com/page';
    
    window.URLAIWidget.shorten({
      url: urlToShorten,
      customCode: 'my-promo',
      onSuccess: function(result) {
        document.getElementById('result').innerHTML = 
          '<a href="' + result.shortUrl + '">' + result.shortUrl + '</a>';
      },
      onError: function(error) {
        alert('Error: ' + error);
      }
    });
  });
</script>
\`\`\`

## Features

- ✅ Single script include - no dependencies
- ✅ Works on any website
- ✅ Custom short codes supported
- ✅ Automatic 1-month expiration
- ✅ Copy to clipboard functionality
- ✅ Error handling

## Browser Support

Works in all modern browsers that support:
- Fetch API
- ES6 (or higher)

## Notes

- Links expire automatically after 1 month
- Custom codes must be unique
- All traffic through the widget is public (no authentication required)
