/*
  Template Script
  =====

  This script builds all functionality on the top of the content created by inline-docs.
*/
(function( global ) {
  "use strict";

  var InlineDocs = (function() {

    var contentColumn,
        navigationColumn;

    return {
      init: function() {
        buildLayout();
        iterateHeaders();
      }
    };

    /*
      Building the layout
      -----

      Markup of the layout:

      ```
      <layout>
        <row>
          <column class="navigation"></column>
          <column class="content"></column>
        <row>
      <layout>

      ```
    */
    function buildLayout() {
      var layout = document.createElement("layout"),
          content = document.body.firstElementChild;

      // > Wrap the content created by inline-docs with the template markup
      layout.innerHTML = "<row>"
                       + "<column class='navigation'></column>"
                       + "<column class='content'></column>"
                       + "</row>";
      document.body.firstElementChild.remove();
      document.body.insertBefore(layout, document.body.firstChild);
      contentColumn = document.querySelectorAll("column.content")[0];
      contentColumn.appendChild(content);
    }

    /*
      Iterate headers
      -----

      Look for `h1`, `h2`, `h3`, `h4`, `h5` and `h6` elements inside content.
    */
    function iterateHeaders() {
      var parentLevel = 0,
          navigationMarkup = "";

      [].forEach.call(contentColumn.querySelectorAll("h1, h2, h3, h4, h5, h6"), function(header) {
        var currentLevel,
            headerText;

        // > Trigger addAnchor(header)
        addAnchor(header);

        // > Check header level hierarchy to build the markup
        currentLevel = header.tagName.substring(1);

        if (currentLevel > parentLevel) {
          navigationMarkup += "<ul class='level-" + currentLevel + "'>";
        } else if (currentLevel === parentLevel) {
          navigationMarkup += "</li>";
        } else {
          navigationMarkup += "</li></ul></li>";
        }

        // > Include current level link
        headerText = header.innerText || header.textContent;
        navigationMarkup += "<li class='level-" + currentLevel + "'><a href='#" + header.id + "'>" + headerText  + "</a>";
        parentLevel = currentLevel;
      });

      navigationMarkup += '</li></ul>';

      // > Include the navigation markup
      navigationColumn = document.querySelectorAll("column.navigation")[0];
      navigationColumn.innerHTML = navigationMarkup;
    }

    /*
      Add anchor to all header with proper id
      -----
    */
    function addAnchor(header) {
      var anchor = document.createElement("a");

      // > If the header don't have an Id, create one
      if (header.id === "" || header.id === "undefined") {
          header.id = header.innerHTML.toLowerCase().replace(/[^\w]+/g, "-");
      }

      // > Wrap the header in the anchor
      anchor.href = "#" + header.id;
      anchor.innerHTML = header.innerHTML;
      header.innerHTML = "";
      header.appendChild(anchor);
    }

  })();

  global.InlineDocs = InlineDocs;
  InlineDocs.init();

})( this );
