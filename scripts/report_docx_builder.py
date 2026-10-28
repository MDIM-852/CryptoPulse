#!/usr/bin/env python3
import os
import zipfile
import html

def xml_escape(text):
    if text is None:
        return ""
    return (str(text).replace("&", "&amp;")
                     .replace("<", "&lt;")
                     .replace(">", "&gt;")
                     .replace('"', "&quot;")
                     .replace("'", "&apos;"))

class DocxBuilder:
    def __init__(self):
        self.body_elements = []

    def add_p(self, text="", align="both", bold=False, italic=False, size=24, space_before=100, space_after=100, line_spacing=360):
        # size in half-points: 24 = 12pt, 28 = 14pt, 32 = 16pt
        p_pr = f'''<w:pPr>
            <w:jc w:val="{align}"/>
            <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line_spacing}" w:lineRule="auto"/>
        </w:pPr>'''
        r_pr = f'''<w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
            <w:sz w:val="{size}"/>
            <w:szCs w:val="{size}"/>
            {"<w:b/>" if bold else ""}
            {"<w:i/>" if italic else ""}
        </w:rPr>'''
        escaped_text = xml_escape(text)
        self.body_elements.append(f'''<w:p>{p_pr}<w:r>{r_pr}<w:t xml:space="preserve">{escaped_text}</w:t></w:r></w:p>''')

    def add_runs_p(self, runs, align="both", space_before=100, space_after=100, line_spacing=360):
        # runs is a list of tuples: (text, bold, italic, size)
        p_pr = f'''<w:pPr>
            <w:jc w:val="{align}"/>
            <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line_spacing}" w:lineRule="auto"/>
        </w:pPr>'''
        runs_xml = []
        for text, bold, italic, size in runs:
            r_pr = f'''<w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
                <w:sz w:val="{size}"/>
                <w:szCs w:val="{size}"/>
                {"<w:b/>" if bold else ""}
                {"<w:i/>" if italic else ""}
            </w:rPr>'''
            runs_xml.append(f'''<w:r>{r_pr}<w:t xml:space="preserve">{xml_escape(text)}</w:t></w:r>''')
        self.body_elements.append(f'''<w:p>{p_pr}{"".join(runs_xml)}</w:p>''')

    def add_page_break(self):
        self.body_elements.append('''<w:p><w:r><w:br w:type="page"/></w:r></w:p>''')

    def add_heading_1(self, text, align="center"):
        self.add_p(text, align=align, bold=True, size=32, space_before=240, space_after=180)

    def add_heading_2(self, text, align="left"):
        self.add_p(text, align=align, bold=True, size=28, space_before=200, space_after=140)

    def add_heading_3(self, text, align="left"):
        self.add_p(text, align=align, bold=True, italic=False, size=26, space_before=160, space_after=100)

    def add_heading_4(self, text, align="left"):
        self.add_p(text, align=align, bold=True, italic=True, size=24, space_before=120, space_after=80)

    def add_code_block(self, code_text, label=""):
        if label:
            self.add_p(f"CODE LISTING: {label}", align="left", bold=True, italic=False, size=20, space_before=140, space_after=40)
        lines = code_text.strip().split("\n")
        for idx, line in enumerate(lines):
            space_before = 60 if idx == 0 else 0
            space_after = 60 if idx == len(lines) - 1 else 0
            p_pr = f'''<w:pPr>
                <w:jc w:val="left"/>
                <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="240" w:lineRule="auto"/>
                <w:pBdr>
                    <w:left w:val="single" w:sz="18" w:space="15" w:color="2563EB"/>
                </w:pBdr>
                <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
            </w:pPr>'''
            r_pr = '''<w:rPr>
                <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>
                <w:sz w:val="18"/>
                <w:szCs w:val="18"/>
                <w:color w:val="0F172A"/>
            </w:rPr>'''
            escaped_line = xml_escape(line)
            self.body_elements.append(f'''<w:p>{p_pr}<w:r>{r_pr}<w:t xml:space="preserve">{escaped_line}</w:t></w:r></w:p>''')
        self.add_p("", space_before=40, space_after=60)

    def add_callout(self, text, label=None, fill="F0F4F8", border_color="1E40AF"):
        lines = text.strip().split("\n")
        for idx, line in enumerate(lines):
            space_before = 100 if idx == 0 else 0
            space_after = 100 if idx == len(lines) - 1 else 0
            p_pr = f'''<w:pPr>
                <w:jc w:val="left"/>
                <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="280" w:lineRule="auto"/>
                <w:pBdr>
                    <w:left w:val="single" w:sz="24" w:space="18" w:color="{border_color}"/>
                </w:pBdr>
                <w:shd w:val="clear" w:color="auto" w:fill="{fill}"/>
            </w:pPr>'''
            runs = []
            if idx == 0 and label:
                runs.append(f'''<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/><w:color w:val="{border_color}"/></w:rPr><w:t xml:space="preserve">[{xml_escape(label)}] </w:t></w:r>''')
            runs.append(f'''<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr><w:t xml:space="preserve">{xml_escape(line)}</w:t></w:r>''')
            self.body_elements.append(f'''<w:p>{p_pr}{"".join(runs)}</w:p>''')
        self.add_p("", space_before=40, space_after=60)

    def add_table(self, headers, rows, col_widths=None):
        tbl_pr = '''<w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:left w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
            </w:tblBorders>
        </w:tblPr>'''

        table_xml = [f'<w:tbl>{tbl_pr}']

        # Header row
        table_xml.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
        for idx, h in enumerate(headers):
            table_xml.append(f'''<w:tc>
                <w:tcPr>
                    <w:shd w:val="clear" w:color="auto" w:fill="E8EEF5"/>
                    <w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>
                </w:tcPr>
                <w:p>
                    <w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/></w:pPr>
                    <w:r>
                        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr>
                        <w:t xml:space="preserve">{xml_escape(h)}</w:t>
                    </w:r>
                </w:p>
            </w:tc>''')
        table_xml.append('</w:tr>')

        # Data rows
        for r_idx, r in enumerate(rows):
            bg_color = "F9FBFC" if r_idx % 2 == 1 else "FFFFFF"
            table_xml.append('<w:tr>')
            for idx, c in enumerate(r):
                align = "left" if idx > 0 else "center"
                table_xml.append(f'''<w:tc>
                    <w:tcPr>
                        <w:shd w:val="clear" w:color="auto" w:fill="{bg_color}"/>
                        <w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:jc w:val="{align}"/><w:spacing w:before="40" w:after="40"/><w:line w:line="280" w:lineRule="auto"/></w:pPr>
                        <w:r>
                            <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/></w:rPr>
                            <w:t xml:space="preserve">{xml_escape(str(c))}</w:t>
                        </w:r>
                    </w:p>
                </w:tc>''')
            table_xml.append('</w:tr>')

        table_xml.append('</w:tbl>')
        self.body_elements.append("".join(table_xml))

    def save(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>'''

        rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

        doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

        styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
                <w:sz w:val="24"/>
                <w:szCs w:val="24"/>
                <w:lang w:val="en-US"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:line="360" w:lineRule="auto"/>
                <w:jc w:val="both"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
</w:styles>'''

        doc_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>
        {"".join(self.body_elements)}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
        </w:sectPr>
    </w:body>
</w:document>'''

        with zipfile.ZipFile(filepath, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", content_types)
            z.writestr("_rels/.rels", rels)
            z.writestr("word/_rels/document.xml.rels", doc_rels)
            z.writestr("word/styles.xml", styles_xml)
            z.writestr("word/document.xml", doc_xml)
        print(f"Generated successfully: {filepath}")
