

var verses; // verses is a global containing an array pointing to each verse element in the bible XML document

function doit()
{
	// fetch the raw text from the text area
	raw_text = document.getElementById('raw_text').value;
	// insert the texts
	final_text = insert_texts(raw_text);
	// insert finished works in the corresponding text area
	document.getElementById('final_text').value = final_text;
}

// this receives a string and returns it with the bible references on individual lines having been replaced by the appropriate texts
function insert_texts(raw_text)
{
	// replace all the new lines with a filler string not found in the text
	// this is to prevent the bcv parser from picking multiple texts
	raw_text = raw_text.replaceAll("\n", "<N>")
	// fetch the references as osis, using the bcv parser
	osises = fetch_refs(raw_text);
	// fetch the raw references in the original text. This is to enable the replace function
	raw_refs = fetch_raw_refs(raw_text, osises);
	// console.log(raw_refs);
	// return;

	// if any references were found
	if (raw_refs.length > 0)
	{
		// iterate through these references
		for (var i = 0; i < raw_refs.length; i++) {
			// fetch osis in osis array
			var osis = osises[i];
			// fetch the reference
			var raw_ref = raw_refs[i];
			// var raw_ref = raw_text.substr(osis.indices[0], osis.indices[1] - osis.indices[0]);
			// fetch the text
			var bible_text = get_bible_text(osis.osis);
			// fetch the reference to be displayed
			var readable_ref = get_readable_reference(osis.osis)
			// compose the final display format
			text_render = ">#### " + readable_ref + "" + "<N>" + "> " + bible_text;
			console.log(text_render);
			console.log(osis.osis);
			// replace the references with the appropriately formatted corresponding texts
			raw_text = raw_text.replace("<N>"+raw_ref+"<N>", "<N>"+text_render+"<N>");
			// raw_text = raw_text.replace("<N></N>"+raw_ref, "\n"+bible_text);
		}
	}
	// replace our filler string with newlines again.
	raw_text = raw_text.replaceAll("<N>", "\n")
	return raw_text;
}

// use library to convert the osis reference to something user-friendly
function get_readable_reference(osisReference)
{
	return osisToEn("niv-long", osisReference) // "Philemon 2"
}

// fetch all the references in the text using bcv parser
function fetch_refs(raw_text)
{
	var bcv = new bcv_parser;
	// bcv.set_options({"book_alone_strategy": "include", "book_sequence_strategy": "include"});
	var osises = bcv.parse(raw_text).osis_and_indices();
	return osises;
}

// fetch all the osis references as written in the text
function fetch_raw_refs(raw_text, osises)
{
	var refs = [];

	if (osises.length > 0)
	{
		for (var i = 0; i < osises.length; i++) {
			var osis = osises[i];
			var raw_ref = raw_text.substr(osis.indices[0], osis.indices[1] - osis.indices[0]);
			refs.push(raw_ref);
		}
	}

	return refs;
}


// fetch and render the bible text: with appropriate fillers, prefixes, etc. also takes care of verse ranges and verse lists
function get_bible_text(reference)
{
	var refs = [];
	var text = "";
	if (reference.search("-") > 0 || reference.search(",") > 0)
	{
		// get the list of individual verses in the range or list specified
		refs = get_verse_refs(reference);
		// get the first verse and append to the verse number
		text = refs[0].split(".")[2] + " " + get_verse_text(refs[0]) + " "
		// iterate over all the remaining verse references
		for (var i = 1; i <= refs.length - 1; i++) {
			// text = text + "**Vs " + refs[i].split(".")[2] + "** " + get_verse_text(refs[i]) + " ";
			// append the next verse, in proper format, to the string containing the previous verses
			text = text + "" + refs[i].split(".")[2] + " " + get_verse_text(refs[i]) + " ";
		}
		return text;
	}
	// for a single verse, get text
	text = get_verse_text(reference);
	return text;
}

// get the list of individual verses in the range or list specified
function get_verse_refs(reference)
{
	// this is only confirmed to work for verses in the same chapter, for now.
	// get start and end references
	var ref_list = [];
	// console.log(chapter);
	// if reference is a range (start and end verse indicated with a dash)
	if (reference.search("-") > 0)
	{
		// get start and end verses
		var ref_range = reference.split("-");
		// split first OSIS reference... 
		var chapter_list = ref_range[0].split(".");
		// ...and compose the chapter from the first two items (book and chapter)
		var chapter = chapter_list[0] + "." + chapter_list[1];
		// get the verse part of the start and end OSIS references
		var ref_start_verse = ref_range[0].split(".")[2];
		var ref_end_verse = ref_range[1].split(".")[2];
		// iterate over every verse number in the specified range
		for (var i = Number(ref_start_verse); i <= Number(ref_end_verse); i++) {
			ref_list.push(chapter + "." + i);
		}
	} else // if the reference is a verse list, with verses separated using commas
	{
		// split it
		var ref_range = reference.split(",");
		
		// var chapter_list = ref_range[0].split(".");
		// var chapter = chapter_list[0] + "." + chapter_list[1];

		// iterate over the verses and create an array
		// the bcv parser already has each verse as a complete OSIS reference. Cool.
		for (var i = 0; i < ref_range.length; i++)
		{
			ref_list.push(ref_range[i]);
		}
	}
	return ref_list;
}

// get the verse text from the XML bible data.
// masterpiece hack.
function get_verse_text(reference)
{
	// this is terrible.
	// iterate over all the verses and check for individual reference.
	// highly inefficient.
	// it should be modified to check, instead, for all the references in one single iteration over the verse.
	// it works for now, though.
	for (i = 0; i < verses.length; i++)
	{
		// if it finds this reference
		if (verses[i].getAttribute("osisID") == reference)
		{
			verse_text = "";
			// set the proper node for the verse
			node = verses[i];
			// now, OSIS has this weird syntax where the verse element is only an indicator and has no text data inside it
			// Rather, the verse text follows.
			// iterate until we get to the next verse element.
			while(node.nextSibling.nodeName != "verse")
			{
				// get the nextSibling -- which is just data
				node = node.nextSibling;
				console.log(node.data);
				// if this node is a transChange -- which is (AFAIK) for words inserted by translator
				if (node.nodeName == "transChange" && node.firstChild != null)
				{
					// append the value, with italicising wrappers, if implemented
					verse_text = "" + verse_text.replace("\n", "") + " " + "_" + node.firstChild.data.replace("\n", "") + "_";
				}
				if (node.data == undefined)
				{
					// if it's undefined, move to next element
					continue;
				}
				// for regular text, append the text to the already compiled verse text data
				// remove newlines, as these seem to abound.
				verse_text = verse_text.replace("\n", "") + node.data;
			}
			// remove leading and trailing spaces
			return verse_text.trim();
		}
	}
	// in case the text doesn't exist
	return "text not found";
}

// load the bible into memory
function load_bible()
{
	// parse the bible XML data, depending on the browser
	if (window.DOMParser)
	{
	    parser = new DOMParser();
	    xmlDoc = parser.parseFromString(bible_content, "text/xml");
	}
	else // Internet Explorer
	{
	    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	    xmlDoc.async = false;
	    xmlDoc.loadXML(bible_content);
	}
	// fetch all the verse nodes and put the array in the verses variable
	verses = xmlDoc.getElementsByTagName("verse");
}
