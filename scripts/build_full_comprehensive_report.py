#!/usr/bin/env python3
import os
import shutil
from report_docx_builder import DocxBuilder
from report_sections_part1 import add_front_matter, add_chapter_1, add_chapter_2
from report_sections_part2 import add_chapter_3, add_chapter_4
from report_sections_part3 import add_chapter_5, add_chapter_6, add_chapter_7

def build_docx_report():
    print("Building Full Comprehensive DOCX Report...")
    b = DocxBuilder()

    # Front Matter
    add_front_matter(b)

    # Chapters 1 to 7
    add_chapter_1(b)
    add_chapter_2(b)
    add_chapter_3(b)
    add_chapter_4(b)
    add_chapter_5(b)
    add_chapter_6(b)
    add_chapter_7(b)

    target_docx = "/Users/mohammedibrahim/Downloads/OOPS PROJECT/docs/CRYPTOCURRENCY_MANAGEMENT_SYSTEM_FULL_REPORT.docx"
    b.save(target_docx)

    # Copy to public directories
    public_docx1 = "/Users/mohammedibrahim/Downloads/OOPS PROJECT/public/CRYPTOCURRENCY_MANAGEMENT_SYSTEM_FULL_REPORT.docx"
    public_docx2 = "/Users/mohammedibrahim/Downloads/OOPS PROJECT/public/reports/CRYPTOCURRENCY_MANAGEMENT_SYSTEM_FULL_REPORT.docx"

    os.makedirs(os.path.dirname(public_docx1), exist_ok=True)
    os.makedirs(os.path.dirname(public_docx2), exist_ok=True)

    shutil.copy2(target_docx, public_docx1)
    shutil.copy2(target_docx, public_docx2)
    print(f"Copied DOCX to:\n  - {public_docx1}\n  - {public_docx2}")

if __name__ == "__main__":
    build_docx_report()
