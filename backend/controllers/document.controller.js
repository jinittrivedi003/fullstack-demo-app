const PDFDocument = require('pdfkit');
const {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, Packer, BorderStyle
} = require('docx');
const User = require('../models/User');

exports.generatePDF = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const d = user.personalDetails;

    if (!d || !d.fullName) {
      return res.status(400).json({ message: 'No personal details found. Please fill in your details first.' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="personal-details-${user.username}.pdf"`);
    doc.pipe(res);

    // Header bar
    doc.rect(0, 0, doc.page.width, 80).fill('#4f46e5');
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
      .text('Personal Details Report', 50, 25, { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 50, 52, { align: 'center' });

    doc.moveDown(3);

    // Section title
    doc.fillColor('#4f46e5').fontSize(14).font('Helvetica-Bold').text('Personal Information', 50);
    doc.moveDown(0.3);
    doc.rect(50, doc.y, doc.page.width - 100, 2).fill('#4f46e5');
    doc.moveDown(0.8);

    const field = (label, value) => {
      const y = doc.y;
      doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text(label, 50, y, { width: 140 });
      doc.fillColor('#1e293b').fontSize(11).font('Helvetica').text(value || 'N/A', 200, y, { width: 350 });
      doc.moveDown(0.8);
    };

    field('Full Name', d.fullName);
    field('Date of Birth', d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString('en-GB') : 'N/A');
    field('Email Address', d.email);
    field('Mobile Number', d.mobileNumber);
    field('Address', d.address);

    if (d.attachments && d.attachments.length > 0) {
      doc.moveDown(0.5);
      doc.fillColor('#4f46e5').fontSize(14).font('Helvetica-Bold').text('Uploaded Documents', 50);
      doc.moveDown(0.3);
      doc.rect(50, doc.y, doc.page.width - 100, 2).fill('#4f46e5');
      doc.moveDown(0.8);

      d.attachments.forEach((att, i) => {
        doc.fillColor('#1e293b').fontSize(10).font('Helvetica')
          .text(`${i + 1}.  ${att.originalName}   (${(att.size / 1024).toFixed(1)} KB)`, 50);
        doc.moveDown(0.4);
      });
    }

    // Footer
    const pageBottom = doc.page.height - 40;
    doc.rect(0, pageBottom - 10, doc.page.width, 50).fill('#f8fafc');
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
      .text(`Confidential — ${user.username}`, 50, pageBottom, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating PDF.', error: err.message });
  }
};

exports.generateDOCX = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const d = user.personalDetails;

    if (!d || !d.fullName) {
      return res.status(400).json({ message: 'No personal details found. Please fill in your details first.' });
    }

    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0 },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 }
    };

    const makeRow = (label, value) => new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: noBorder,
          children: [new Paragraph({
            children: [new TextRun({ text: label, bold: true, color: '64748b', size: 22 })]
          })]
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          borders: noBorder,
          children: [new Paragraph({
            children: [new TextRun({ text: value || 'N/A', color: '1e293b', size: 22 })]
          })]
        })
      ]
    });

    const rows = [
      makeRow('Full Name', d.fullName),
      makeRow('Date of Birth', d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'),
      makeRow('Email Address', d.email),
      makeRow('Mobile Number', d.mobileNumber),
      makeRow('Address', d.address)
    ];

    const children = [
      new Paragraph({
        children: [new TextRun({ text: 'Personal Details Report', bold: true, size: 48, color: '4f46e5' })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({
          text: `Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
          size: 20, color: '64748b'
        })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [new TextRun({ text: 'Personal Information', bold: true, size: 28, color: '4f46e5' })],
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({ text: '' }),
      new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })
    ];

    if (d.attachments && d.attachments.length > 0) {
      children.push(new Paragraph({ text: '' }));
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Uploaded Documents', bold: true, size: 28, color: '4f46e5' })],
        heading: HeadingLevel.HEADING_2
      }));
      d.attachments.forEach((att, i) => {
        children.push(new Paragraph({
          children: [new TextRun({
            text: `${i + 1}.  ${att.originalName}  (${(att.size / 1024).toFixed(1)} KB)`,
            size: 22, color: '1e293b'
          })]
        }));
      });
    }

    children.push(new Paragraph({ text: '' }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Confidential — ${user.username}`, size: 18, color: '94a3b8', italics: true })],
      alignment: AlignmentType.CENTER
    }));

    const docFile = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(docFile);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="personal-details-${user.username}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating DOCX.', error: err.message });
  }
};
