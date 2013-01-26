#!/bin/bash

echo Compiling stylesheets...
lessc ./less/screen.less ./css/screen.css --compress
lessc ./less/phone.less ./css/phone.css --compress
lessc ./less/tablet.less ./css/tablet.css --compress
echo complete.