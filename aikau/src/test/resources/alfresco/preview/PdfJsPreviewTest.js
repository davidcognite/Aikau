/**
 * Copyright (C) 2005-2015 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @author Dave Draper
 */
define(["intern!object",
        "intern/chai!expect",
        "intern/chai!assert",
        "require",
        "alfresco/TestCommon",
        "intern/dojo/node!leadfoot/keys"], 
        function (registerSuite, expect, assert, require, TestCommon, keys) {

   registerSuite({
      name: 'PdfJs Previewer Tests',
      'Test Previewer Loads': function () {
         var testname = "PdfJs Preview Test";
         return TestCommon.loadTestWebScript(this.remote, "/PdfJsPreview", testname)
            .findByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs")
               .then(null, function() {
                  assert(false, "Test #1a - Couldn't find plugin node");
               })
            .end()
            .findByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs > div.viewer.documentView")
               .then(null, function() {
                  assert(false, "Test #1b - Couldn't find preview node");
               })
            .end()

            .findAllByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs > div.viewer.documentView > div.page")
               .then(function(elements) {
                  TestCommon.log(testname,"Counting rendered pages...");
                  assert(elements.length == 6, "Test #1c - Six pages were not rendered");
               })
            .end();
      },
      'Test Previous Button Disabled (on page load)': function() {
         // The previous page button should be disabled because we should be on the first page...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_PREVIOUS_PAGE.dijitDisabled")
            .then(null, function() {
               assert(false, "The previous page button was not disabled on page load");
            })
         .end();
      },
      'Test Next Button Enabled (on page load)': function() {
         // The next page button should be enabled because we should be on the first page...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_NEXT_PAGE.dijitDisabled")
            .then(
               function() {
                  assert(false, "The next page button was disabled on page load");
               }, 
               function() {
                  // No action required.
               }
            )
         .end();
      },
      'Test Next Page Button Enables Previous Page': function() {
         // When the next page button is pressed the previous page button should be enabled
         // and the active page CSS class should move...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1.activePage")
            .then(null, function() {
               assert(false, "The first page was not marked as the active page on load");
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_NEXT_PAGE")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_PREVIOUS_PAGE.dijitDisabled")
            .then(
               function() {
                  assert(false, "The previous page button was enabled when the next page button was clicked");
               }, 
               function() {
                  // No action required.
               }
            )
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-2.activePage")
            .then(null, function() {
               assert(false, "The second page did not become the active page when the next page button was clicked");
            })
         .end();
      },
      'Test Jump To Last Page': function() {
         // Test using the jump to last page. This should make the last page (page 6) the active page
         // and should disabled the next page button...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SET_PAGE")
            .click()
         .end()

         // Because we've used the next page button the initial value of the input control should be 2...
         .findByCssSelector("#PDF_PLUGIN_1_SET_PAGE_CONTROL .dijitInputContainer input")
            .getProperty('value')
            .then(function(resultText) {
               assert(resultText == "2", "The initial value when selecting a page should be 2: " + resultText);
            })
            .clearValue()
            .type("6")
         .end()

         // Confirm the page selection...
         .findByCssSelector(".alfresco-dialog-AlfDialog .footer > span:first-child > span")
            .click()
         .end()

         // Check that page 6 is the active page...
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-6.activePage")
            .then(null, function() {
               assert(false, "The 6th page did not become the active page having used the set page dialog");
            })
         .end();
      },
      'Test Next Page Button Disabled (when last page is active)': function() {
         // NOTE: This test needs to follow immediately after selecting the last page...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_NEXT_PAGE.dijitDisabled")
            .then(null, function() {
               assert(false, "The previous page button was not disabled on page load");
            })
         .end();
      },
      'Test Previous Page Button Disables (on scroll)': function() {
         // When the viewer element is scrolled back to the top, the first page should become active again...
         return this.remote.execute("document.getElementById('PDF_PLUGIN_1-viewer').scrollTop = 0;")
            .sleep(500) // NOTE: Sleep is required to allow the scroll to complete...
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1.activePage")
            .then(null, function() {
               assert(false, "The first page did not become active after scrolling to the top of the viewer");
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_PREVIOUS_PAGE.dijitDisabled")
             .then(null, function() {
               assert(false, "The previous page button was not disabled when scrolling back to the top of the viewer");
            })
         .end();
      },
      'Test Zoom Out': function() {
         var initialWidth = null;
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1 > canvas")
            .getSize()
            .then(function(size) {
               initialWidth = size.width;
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_ZOOM_OUT")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1 > canvas")
            .getSize()
            .then(function(size) {
               assert(initialWidth > size.width, "The size of the canvas element did not reduce on zoom out");
               initialWidth = size.width;
            })
         .end();
      },
      'Test Zoom In': function() {
         var initialWidth = null;
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1 > canvas")
            .getSize()
            .then(function(size) {
               initialWidth = size.width;
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_ZOOM_IN")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1 > canvas")
            .getSize()
            .then(function(size) {
               assert(initialWidth < size.width, "The size of the canvas element did not increase on zoom in");
               initialWidth = size.width;
            })
         .end();
      },
      'Test Zoom Select 25%': function() {
         // This test attempts to check that the zoom to a fixed size (in this case 25%) approximately
         // sets the size as expected. First of all it gets the current zoom level and then works out
         // the actual size of the full canvas, then sets the zoom level and checks that the updated
         // canvas size is approximately as expected (a margin of error is allowed - it won't ever be
         // pixel perfect!)
         var currentZoomLevel = null;
         var actualSize = null;
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_ZOOM_SET_SELECT_MENU_text")
            .getVisibleText()
            .then(function(text) {
               currentZoomLevel = text.substring(0, text.length-1);
               console.log("Current zoom level is " + currentZoomLevel);
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1 > canvas")
            .getSize()
            .then(function(size) {
               actualSize = size.width * (100 / currentZoomLevel);
               console.log("Actual canvas size is: " + actualSize);
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_ZOOM_SET_SELECT_MENU")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_ZOOM_25")
            .click()
         .end()
         .sleep(500) // NOTE: Sleep is required to allow re-rendering...
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1 > canvas")
            .getSize()
            .then(function(size) {
               var expectedSize = actualSize * 0.25;
               // Allow for 10 pixels margin of error either side of calculated value...
               assert((size.width > expectedSize - 5) && (size.width < expectedSize + 5) , "Canvas hasn't shrunk to 25%, expected size: " + expectedSize + ", actual size was: " + size.width);
            })
         .end();
      },
      'Test SideBar is hidden (on page load)': function() {
         return this.remote.findByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs .sidebar")
            .then(null, function() {
               assert(false, "Could not find sidebar component");
            })
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === false, "The sidebar should not be displayed on page load");
            })
         .end();
      },
      'Test SideBar Reveal': function() {
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_SIDEBAR")
            .click()
         .end()
         .findByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs .sidebar")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === true, "The sidebar was not revealed after using toggle");
            })
         .end();
      },
      'Test SideBar Hide': function() {
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_SIDEBAR")
            .click()
         .end()
         .findByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs .sidebar")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === false, "The sidebar was not hidden after using toggle");
            })
         .end();
      },
      'Test Thumbnails Exist': function() {
         // Make sure to reveal the sidebar again (it will have been hidden after the last test...)
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_SIDEBAR")
            .click()
         .end()
         .findAllByCssSelector("#PDF_PLUGIN_1-thumbnails > div.page")
            .then(function(elements) {
               assert(elements.length == 6, "Six thumbnails were not rendered");
            })
         .end();
      },
       'Test Thumbnail Navigation': function() {
         // This test is going to check that navigation works by clicking on thumbnails, but as
         // a by-product we're going to switch to single page width viewing mode to assist with
         // active page selection...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1.activePage")
            .then(null, function() {
               assert(false, "The first page was not active as expected at the start of this test");
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_ZOOM_SET_SELECT_MENU")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_ZOOM_PAGE_WIDTH")
            .click()
         .end()
         .sleep(500) // NOTE: Allow re-rendering
         .findByCssSelector("#PDF_PLUGIN_1-thumbnails-canvas-2")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-2.activePage")
            .then(null, function() {
               assert(false, "The second page was not active after clicking it's thumbnail");
            })
         .end();
      },
      'Test Page Selection Display': function() {
         // Just a quick check that the set page menu bar item is having its label updated...
         this.remote.findByCssSelector("#PDF_PLUGIN_1_SET_PAGE")
            .getVisibleText()
            .then(function(text) {
               assert(text === "2 / 6", "Set page menu item was not updated with correct page information: " + text);
            })
         .end();
      },
      'Test Link Controls are hidden (on page load)': function() {
         this.remote.findByCssSelector("#PDF_PLUGIN_1_LINK_CONTROLS")
            .then(null, function() {
               assert(false, "Could not find link controls DOM node");
            })
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === false, "The link controls should not be displayed on page load");
            })
         .end();
      },
      'Test Link Controls Reveal': function() {
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_LINK")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_LINK_CONTROLS")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === true, "The link controls were not revealed after using toggle");
            })
         .end();
      },
      'Test Link Controls Hide': function() {
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_LINK")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_LINK_CONTROLS")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === false, "The link controls were not hidden after using toggle");
            })
         .end();
      },
      'Test Link Value': function() {
         // Make sure to reveal the link controls again!!
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_LINK")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_LINK .dijitInputContainer input")
            .getValue()
            .then(function(value) {
               assert(value.indexOf("/aikau/page/tp/ws/PdfJsPreview#page=2") != -1, "The link was not generated correctly: " + value);
            })
         .end();
      },
      // TODO: Test quarantined as it fails intermittently - needs reviewing and improving for consistency.
      // 'Test Link Update': function() {
      //    // In order to test the update link button we need to switch page whilst the link controls are
      //    // open, we're going to click on a thumbnail again to do this...
      //    return this.remote.findByCssSelector("#PDF_PLUGIN_1-thumbnails-canvas-1")
      //       .click()
      //    .end()
      //    .findByCssSelector("#PDF_PLUGIN_1_UPDATE_LINK")
      //       .click()
      //    .end()
      //    .sleep(500) // NOTE: Sleep required to scroll to page...
      //    .findByCssSelector("#PDF_PLUGIN_1_LINK .dijitInputContainer input")
      //       .getValue()
      //       .then(function(value) {
      //          assert(value.indexOf("/aikau/page/tp/ws/PdfJsPreview#page=1") != -1, "The link was not updated correctly: " + value);
      //       })
      //    .end();
      // },
      'Test Search Controls are hidden (on page load)': function() {
         this.remote.findByCssSelector("#PDF_PLUGIN_1_SEARCH_CONTROLS")
            .then(null, function() {
               assert(false, "Could not find search controls DOM node");
            })
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === false, "The search controls should not be displayed on page load");
            })
         .end();
      },
      'Test Search Controls Reveal': function() {
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_SEARCH")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SEARCH_CONTROLS")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === true, "The search controls were not revealed after using toggle");
            })
         .end();
      },
      'Test Search Controls Hide': function() {
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_SEARCH")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SEARCH_CONTROLS")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === false, "The search controls were not hidden after using toggle");
            })
         .end();
      },
      'Test Search Highlight Count (ignore case, single highlight)': function() {
         // NOTE: Need to make sure search controls are revealed again...
         // This test is just going to count the number of highlighted elements across all the 
         // text layers across all the pages (the next test will check the highlighted element)
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SHOW_SEARCH")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SEARCH_FORM .dijitInputContainer input")
            .clearValue()
            .type("p")
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SEARCH_FORM .dijitButtonContents")
            .click()
         .end()
         .findAllByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .then(function(elements) {
               assert(elements.length === 1, "Only one letter should be highlighted");
            })
         .end();
      },
      'Test Search Highlighted Value': function() {
         // Test that the highlighted value is correct... note that we have searched for "p" but should
         // have found "P" because the default behaviour is to ignore case...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .getVisibleText()
            .then(function(text) {
               assert(text === "P", "The highlighted character was incorrect, expected 'P' found: " + text);
            })
         .end();
      },
      'Test Search All Matches Highlighted': function() {
         // Switch into highlighting all, now 6 elements should be matched to the CSS selector...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_HIGHLIGHT")
            .click()
         .end()
         .findAllByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .then(function(elements) {
               assert(elements.length === 6, "Six letters should be highlighted");
            })
         .end();
      },
      'Test Exact Case Search (no matches)': function() {
         // We're not going to enable exact case matching (so that our current search criteria will fail)
         // and this should remove all existing highlighting...
         this.remote.findByCssSelector("#PDF_PLUGIN_1_MATCH_CASE")
            .click()
         .end()
         .findAllByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .then(function(elements) {
               assert(elements.length === 0, "No letters should be highlighted (when case is matched");
            })
         .end();
      },
      'Test Exact Case Search (with matches)': function() {
         // Now enter the exactly matching case...
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SEARCH_FORM .dijitInputContainer input")
            .clearValue()
            .type("P")
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SEARCH_FORM .dijitButtonContents")
            .click()
         .end()
         .findAllByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .then(function(elements) {
               assert(elements.length === 6, "Six letters should be highlighted");
            })
         .end();
      },
      'Test Find Next': function() {
         // We're going to test the find next match capability, and we want to ensure that the pages
         // update as we search through the document. To ensure that the active page changes as scrolling
         // occurs we need to make sure we remaing in single page width mode (which we still should be!)
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1.activePage")
            .then(null, function() {
               assert(false, "It was expected that the first page would be active when the test started");
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_FIND_NEXT")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-2.activePage")
            .then(null, function() {
               assert(false, "The second page did not become the active page as we went to the next search result");
            })
         .end();
      },
      'Test Find Previous': function() {
         // We're going to test the find next match capability, and we want to ensure that the pages
         // update as we search through the document. To ensure that the active page changes as scrolling
         // occurs we need to make sure we remaing in single page width mode (which we still should be!)
         return this.remote.findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-2.activePage")
            .then(null, function() {
               assert(false, "It was expected that the second page would be active when the test started");
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_FIND_PREVIOUS")
            .click()
         .end()
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-1.activePage")
            .then(null, function() {
               assert(false, "The first page did not become the active page as we went to the previous search result");
            })
         .end()
      },
      'Test hiding the search bar hides the highlights': function() {
         // Need reference to browser for posting coverage after last test...
         var browser = this.remote;

         // Search for 'P' and expect some highlights
         return this.remote.findByCssSelector("#PDF_PLUGIN_1_SEARCH_FORM .dijitInputContainer input")
            .clearValue()
            .type("P")
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SEARCH_FORM .dijitButtonContents")
            .click()
         .end()
         .findAllByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .then(function(elements) {
               expect(elements).to.have.length.above(0, "There should be at least one highlight");
            })
         .end()

         // Click the search button to hide the tools
         .findByCssSelector("#PDF_PLUGIN_1_SHOW_SEARCH")
            .click()
         .end()

         // Wait for the hide process to happen
         .sleep(1000)

         // There should now be no highlights
         .findAllByCssSelector("#PDF_PLUGIN_1-viewer .textLayer .highlight")
            .then(function(elements) {
               expect(elements).to.have.length(0, "There should now be no highlights");
            })
         .end()

         .alfPostCoverageResults(browser);
      }
   });
   registerSuite({
      name: 'PdfJs Previewer Outline Tests',
      'Test Outline Loads': function () {
         return TestCommon.loadTestWebScript(this.remote, "/PdfJsOutlinePreview", "PdfJs Outline Test")
         .findAllByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs > div.viewer.documentView > div.page")
            .then(function(elements) {
               assert(elements.length == 3, "Test #1c - 3 pages were not rendered");
            })
         .end()
         .findByCssSelector("#PDF_PLUGIN_1_SHOW_SIDEBAR")
            .click()
         .end()
         .findByCssSelector(".alfresco-preview-AlfDocumentPreview > div.previewer.PdfJs .sidebar div.dijitTabContainerTop-tabs > div.dijitTab:nth-child(2)")
            .click()
         .end()
         .findByCssSelector(".alfresco-preview-PdfJs-Outline")
            .isDisplayed()
            .then(function(displayed) {
               assert(displayed === true, "The outline view was not displayed");
            })
         .end();
      },
      'Test Outline Element Count': function() {
         return this.remote.findAllByCssSelector(".alfresco-preview-PdfJs-Outline .outlineItem")
            .then(function(elements) {
               assert(elements.length === 3, "There should be 3 outline elements, found: " + elements.length);
            })
         .end();
      },
      'Test Outline Structure': function() {
         return this.remote.findByCssSelector(".alfresco-preview-PdfJs-Outline .outlineItem > div > div > div > div > a")
            .then(null, function() {
               assert(false, "Did not find expected outline structure");
            })
         .end();
      },
      'Test Outline Navigation': function() {
         // Need reference to browser for posting coverage after last test...
         var browser = this.remote;

         return this.remote.findByCssSelector(".alfresco-preview-PdfJs-Outline .outlineItem > div > div > div > div > a")
            .click()
         .end()
         .sleep(500)
         .findByCssSelector("#PDF_PLUGIN_1-viewer-pageContainer-3.activePage")
            .then(null, function() {
               assert(false, "The last page did not become the active page having clicked on an outline element");
            })
         .end().alfPostCoverageResults(browser);
      }
   });
});