# Demo Projects

This repository contains two related projects for automating form filling with Excel data.

## Projects

### 1. Extension
A Chrome browser extension that automatically fills multi-step forms (steppers) from Excel files. The extension reads user data from Excel spreadsheets (.xlsx) and populates form fields across multiple steps, automatically navigating through the form stepper.

**Features:**
- Load Excel files (.xlsx) from the extension popup
- Read user data: name, lastname, age, city, years of experience, and role
- Automatically fill form fields and navigate through stepper steps

### 2. Slides
A demo web page featuring a multi-step form (stepper) that collects personal information. The form consists of three steps:
- **Step 1:** Personal data (name, lastname)
- **Step 2:** Location (age, city)
- **Step 3:** Experience (years of experience, role)

This page serves as a demonstration target for the Extension project.

## Usage

1. Open the `Slides/index.html` page in your browser
2. Install the Extension in Chrome (Developer mode)
3. Use the extension to load an Excel file and automatically fill the form

