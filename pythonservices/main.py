from fastapi import FastAPI, UploadFile, File, BackgroundTasks,Query, HTTPException
from fastapi.responses import FileResponse
from pdf2docx import Converter
import os
import uuid
import fitz  # PyMuPDF
import subprocess
app = FastAPI()

# Helper function to delete files after the response is sent
def cleanup(files: list):
    for file in files:
        if os.path.exists(file):
            os.remove(file)
            
            




@app.post("/compress")
async def compress_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    # Power 1: Highest compression (72 dpi)
    # Power 4: Lowest compression (300 dpi)
    power: int = Query(1, ge=1, le=4) 
):
    job_id = str(uuid.uuid4())
    input_path = f"/tmp/{job_id}_input.pdf"
    output_path = f"/tmp/{job_id}_compressed.pdf"

    # Save uploaded file
    with open(input_path, "wb") as buffer:
        buffer.write(await file.read())

    # Map user input to Ghostscript PDFSETTINGS
    quality_map = {
        1: "/screen",   # 72 dpi (smallest file)
        2: "/ebook",    # 150 dpi (balanced)
        3: "/printer",  # 300 dpi (high quality)
        4: "/prepress"  # 300 dpi (color preserved)
    }
    
    gs_setting = quality_map.get(power)

    # Ghostscript Command
    gs_command = [
        "gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={gs_setting}",
        "-dNOPAUSE", "-dQUIET", "-dBATCH",
        f"-sOutputFile={output_path}", input_path
    ]

    try:
        # Run the compression
        subprocess.run(gs_command, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail="Ghostscript compression failed.")

    background_tasks.add_task(cleanup, [input_path, output_path])

    return FileResponse(
        path=output_path,
        filename=file.filename.replace(".pdf", "_compressed.pdf"),
        media_type='application/pdf'
    )
@app.post("/convert")
async def convert_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Generate a unique ID so users don't overwrite each other's files
    job_id = str(uuid.uuid4())
    pdf_path = f"/tmp/{job_id}.pdf"  # Use Linux /tmp folder for speed
    docx_path = f"/tmp/{job_id}.docx"

    # Save uploaded file to Linux /tmp directory
    with open(pdf_path, "wb") as buffer:
        buffer.write(await file.read())

    # Convert
    cv = Converter(pdf_path)
    cv.convert(docx_path)
    cv.close()

    # Add a background task to delete the files 1 minute after sending
    background_tasks.add_task(cleanup, [pdf_path, docx_path])

    return FileResponse(
        path=docx_path,
        filename=file.filename.replace(".pdf", ".docx"),
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )