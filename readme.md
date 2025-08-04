# Bible Text Inserter

## Introduction

This is a project to replace bible references into a text with the bible texts in a user-defined format, to make life easier for those who need to do so frequently.

It searches through the supplied text for bible references and replaces these references with the corresponding bible text, formatted as required.

It still needs a lot of work, though. This only has the KJV (it likely works with whatever osis file is used); it really needs to be optimised, and the UI has to be worked on. Also, it formats the texts for my personal preferred markdown format: ~~options should be provided, instead~~ options have been provided, and it's customisable, soo...

## How to Use

- It is hosted online at https://bibletextinsert.netlify.app/

OR to use locally

- Open `index.html` in your browser.
- Insert the text in the raw_text textarea, ensuring that each bible reference to be replaced is the only text on a line.
- Click the button 🤷🏾‍♂️.
- The result will be output in the final_text textarea.
- Rich Text can be worked on in `rich_text.html`; however, for now, it only works when the references are totally unformatted, and requires an internet connection to download the script files for TipTap (and, by extension, ProseMirror).

## Resources Used

The KJV bible in OSIS format was obtained from @seven1m's repo at: https://github.com/seven1m/open-bibles/blob/master/eng-kjv.osis.xml

The bcv parser library by @openbibleinfo can be obtained from: https://github.com/openbibleinfo/Bible-Passage-Reference-Parser

The bible reference formatter, also by @openbibleinfo can be obtained from: https://github.com/openbibleinfo/Bible-Reference-Formatter

The rich text editor used is TipTap, which wraps around ProseMirror -- amazing projects! Check them out here: https://tiptap.dev/ and https://prosemirror.net/
