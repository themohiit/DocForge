from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from pdf2docx import Converter
import os
import uuid

app = FastAPI()

# Helper function to delete files after the response is sent
def cleanup(files: list):
    for file in files:
        if os.path.exists(file):
            os.remove(file)

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