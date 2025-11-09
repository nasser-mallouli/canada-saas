"""
Utility functions for PDF generation from Markdown
"""
import markdown
from weasyprint import HTML, CSS
from django.conf import settings
from pathlib import Path
import os
from datetime import datetime
import uuid


def markdown_to_pdf(markdown_text: str, output_path: str) -> str:
    """
    Convert Markdown text to PDF with proper formatting.
    
    Args:
        markdown_text: The Markdown content to convert
        output_path: Full path where the PDF should be saved
        
    Returns:
        The path to the generated PDF file
        
    Raises:
        Exception: If PDF generation fails
    """
    print(f"\n[PDF CONVERSION] Starting Markdown to PDF conversion")
    print(f"[PDF CONVERSION] Input markdown length: {len(markdown_text)} characters")
    print(f"[PDF CONVERSION] Output path: {output_path}")
    
    try:
        # Convert Markdown to HTML
        print(f"[PDF CONVERSION] Step 1: Converting Markdown to HTML...")
        html_content = markdown.markdown(
            markdown_text,
            extensions=[
                'extra',  # Adds support for tables, fenced code blocks, etc.
                'tables',  # Better table support
                'nl2br',  # Convert newlines to <br>
                'sane_lists',  # Better list formatting
            ]
        )
        print(f"[PDF CONVERSION] ✓ HTML generated (length: {len(html_content)} characters)")
        
        # Clean up HTML content - remove any problematic characters
        html_content = html_content.replace('\x00', '')  # Remove null bytes
        print(f"[PDF CONVERSION] ✓ HTML cleaned (removed null bytes)")
        
        # Wrap in a styled HTML document with simplified CSS for WeasyPrint compatibility
        styled_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: A4;
            margin: 2cm;
        }}
        
        body {{
            font-family: Helvetica, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333333;
        }}
        
        h1 {{
            font-size: 24pt;
            font-weight: bold;
            color: #1a1a1a;
            margin-top: 20pt;
            margin-bottom: 12pt;
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 8pt;
        }}
        
        h2 {{
            font-size: 18pt;
            font-weight: bold;
            color: #2c5aa0;
            margin-top: 16pt;
            margin-bottom: 10pt;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 6pt;
        }}
        
        h3 {{
            font-size: 14pt;
            font-weight: bold;
            color: #444444;
            margin-top: 12pt;
            margin-bottom: 8pt;
        }}
        
        h4 {{
            font-size: 12pt;
            font-weight: bold;
            color: #555555;
            margin-top: 10pt;
            margin-bottom: 6pt;
        }}
        
        p {{
            margin-top: 8pt;
            margin-bottom: 8pt;
        }}
        
        ul, ol {{
            margin-top: 8pt;
            margin-bottom: 8pt;
            padding-left: 24pt;
        }}
        
        li {{
            margin-top: 4pt;
            margin-bottom: 4pt;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 12pt;
            margin-bottom: 12pt;
            font-size: 10pt;
        }}
        
        th {{
            background-color: #2c5aa0;
            color: white;
            font-weight: bold;
            padding: 8pt;
            text-align: left;
            border: 1px solid #1a4a7a;
        }}
        
        td {{
            padding: 6pt 8pt;
            border: 1px solid #dddddd;
        }}
        
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        
        blockquote {{
            border-left: 4px solid #2c5aa0;
            padding-left: 12pt;
            margin-left: 0;
            margin-top: 8pt;
            margin-bottom: 8pt;
            color: #555555;
            font-style: italic;
        }}
        
        code {{
            background-color: #f4f4f4;
            padding: 2pt 4pt;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
        }}
        
        pre {{
            background-color: #f4f4f4;
            padding: 8pt;
            margin-top: 8pt;
            margin-bottom: 8pt;
        }}
        
        pre code {{
            background-color: transparent;
            padding: 0;
        }}
        
        hr {{
            border: none;
            border-top: 1px solid #dddddd;
            margin: 16pt 0;
        }}
        
        strong {{
            font-weight: bold;
            color: #1a1a1a;
        }}
        
        em {{
            font-style: italic;
        }}
        
        h1, h2 {{
            page-break-after: avoid;
        }}
        
        table {{
            page-break-inside: avoid;
        }}
    </style>
</head>
<body>
    {html_content}
</body>
</html>"""
        
        # Ensure output directory exists
        output_dir = os.path.dirname(output_path)
        if output_dir:
            print(f"[PDF CONVERSION] Step 2: Creating output directory: {output_dir}")
            os.makedirs(output_dir, exist_ok=True)
            print(f"[PDF CONVERSION] ✓ Directory created/verified")
        
        # Generate PDF with error handling
        print(f"[PDF CONVERSION] Step 3: Generating PDF with WeasyPrint...")
        print(f"[PDF CONVERSION]   - HTML length: {len(styled_html)} characters")
        print(f"[PDF CONVERSION]   - Writing to: {output_path}")
        try:
            HTML(string=styled_html, base_url=None).write_pdf(output_path)
            print(f"[PDF CONVERSION] ✓ PDF file written successfully")
        except Exception as e:
            print(f"[PDF CONVERSION] ⚠ Initial PDF generation failed: {str(e)}")
            print(f"[PDF CONVERSION] Trying fallback with simpler CSS...")
            # Try with a simpler approach if the first fails
            # Remove problematic CSS properties and try again
            simple_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ size: A4; margin: 2cm; }}
        body {{ font-family: Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.6; }}
        h1 {{ font-size: 24pt; font-weight: bold; margin: 20pt 0 12pt 0; border-bottom: 2px solid #2c5aa0; padding-bottom: 8pt; }}
        h2 {{ font-size: 18pt; font-weight: bold; color: #2c5aa0; margin: 16pt 0 10pt 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 6pt; }}
        h3 {{ font-size: 14pt; font-weight: bold; margin: 12pt 0 8pt 0; }}
        p {{ margin: 8pt 0; }}
        ul, ol {{ margin: 8pt 0; padding-left: 24pt; }}
        table {{ width: 100%; border-collapse: collapse; margin: 12pt 0; }}
        th {{ background-color: #2c5aa0; color: white; padding: 8pt; border: 1px solid #1a4a7a; }}
        td {{ padding: 6pt 8pt; border: 1px solid #dddddd; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
    </style>
</head>
<body>
    {html_content}
</body>
</html>"""
            HTML(string=simple_html, base_url=None).write_pdf(output_path)
            print(f"[PDF CONVERSION] ✓ PDF generated using fallback CSS")

        # Verify file was created
        print(f"[PDF CONVERSION] Step 4: Verifying PDF file...")
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"[PDF CONVERSION] ✓ PDF file verified")
            print(f"[PDF CONVERSION]   - File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
        else:
            print(f"[PDF CONVERSION] ⚠ WARNING: PDF file not found after generation!")

        print(f"[PDF CONVERSION] ✓ PDF conversion completed successfully!")
        return output_path

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"[PDF CONVERSION] ✗ ERROR: PDF generation failed")
        print(f"[PDF CONVERSION] Error: {str(e)}")
        print(f"[PDF CONVERSION] Traceback:\n{error_details}")
        error_msg = f"PDF generation failed: {str(e)}"
        raise Exception(error_msg) from e


def generate_pdf_filename(prefix: str = "immigration_report") -> str:
    """
    Generate a unique filename for PDF storage.
    
    Args:
        prefix: Prefix for the filename
        
    Returns:
        A unique filename with timestamp and UUID
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"{prefix}_{timestamp}_{unique_id}.pdf"


def get_pdf_storage_path(filename: str) -> str:
    """
    Get the full path for storing a PDF file.
    
    Args:
        filename: The filename for the PDF
        
    Returns:
        Full path to the PDF file in the media directory
    """
    media_root = Path(settings.MEDIA_ROOT)
    pdf_dir = media_root / "reports"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    return str(pdf_dir / filename)


def get_pdf_url(filename: str) -> str:
    """
    Get the URL path for accessing a PDF file.
    
    Args:
        filename: The filename for the PDF
        
    Returns:
        URL path to the PDF file
    """
    return f"{settings.MEDIA_URL}reports/{filename}"

