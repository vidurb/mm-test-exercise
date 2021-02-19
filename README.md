# mm-test-exercise

This is a simple API for a exercise assigned to me.
It exposes a single POST route at the root (`/`) of the host that accepts
a multipart form encoded POST request with a single form parameter named 'image'
which should be an image file. It resizes the image to 100x100 & 200x200, applies
a watermark, uploads the processed images to an S3 bucket and returns presigned
URLs to access the processed images that are valid for 24 hours.

## Usage

- Run `npm ci` to install dependencies
- Run `npm run dev` to start the server on port 9000 with hot reloading enabled,
or `npm run prod` to start the server without hot reloading.
