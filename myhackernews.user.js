// ==UserScript==
// @name         myhackernews
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Apply a dark theme to Hacker News and modify navigation links
// @license      MIT
// @copyright    jeanlucaslima
// @author       jeanlucaslima
// @homepageURL  https://github.com/jeanlucaslima/myhackernews/
// @supportURL   https://github.com/jeanlucaslima/myhackernews/issues
// @match        https://news.ycombinator.com/*
// @updateURL    https://openuserjs.org/meta/jeanlucaslima/My_Script.meta.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Function to add dark theme styles
  function addDarkTheme() {
      const style = document.createElement('style');
      style.textContent = `
          body, tbody {
              background-color: #1f1f1f;
              color: #e0e0e0;
          }
          a {
              color: #828282;
          }
          a:link {
              color: #828282;
          }
          .pagetop {
              background-color: #1f1f1f;
              border-bottom: 1px solid #333;
              padding: 10px 0;
          }
          .pagetop a {
              color: #ededed;
          }
          .pagetop a:visited {
              color: #828282;
          }
          .hnname a {
              color: #bb86fc;
          }
          td {
              background-color: #1f1f1f;
          }
          td.title a {
              color: #ededed;
          }
          .subtext a {
              color: #03dac6;
          }
          td.title {
              background-color: #1f1f1f;
          }
          td.subtext {
              background-color: #1f1f1f;
          }
          .itemlist tr:nth-child(even) td {
              background-color: #1c1c1c;
          }
          .itemlist tr:nth-child(odd) td {
              background-color: #121212;
          }
          table {
              background-color: #1f1f1f !important;
          }
          .c00, .c00 a:link { color:#626262; }
      `;
      document.head.appendChild(style);
  }

  // Function to modify the navigation links
  function modifyNav() {

      // Find the span with class pagetop
      var pagetop = document.querySelector('span.pagetop');
      if (pagetop) {
          // Remove the "submit" link
          var submitLink = pagetop.querySelector('a[href="submit"]');
          if (submitLink) {

              // Remove the separator before the submit link
              var separator = submitLink.previousSibling;
              if (separator && separator.nodeType === Node.TEXT_NODE && separator.textContent.includes('|')) {
                  pagetop.removeChild(separator);

              }
              // Remove the submit link
              pagetop.removeChild(submitLink);
          } else {
              console.log('Submit link not found');
          }

          // Remove the "jobs" link
          var jobsLink = pagetop.querySelector('a[href="jobs"]');
          if (jobsLink) {
              // Remove the separator before the submit link
              var jobsSeparator = jobsLink.previousSibling;
              if (jobsSeparator && jobsSeparator.nodeType === Node.TEXT_NODE && jobsSeparator.textContent.includes('|')) {
                  pagetop.removeChild(jobsSeparator);

              }
              // Remove the submit link
              pagetop.removeChild(jobsLink);

          } else {
              console.log('Jobs link not found');
          }

          // Check the current path
          var path = window.location.pathname;

          // Create and append the "best" link if not on /best
          if (path !== '/best') {
              var bestLink = document.createElement('a');
              bestLink.href = 'best';
              bestLink.textContent = 'best';

              // Create the separator
              var separatorBest = document.createTextNode(' | ');

              // Append the separator and the new link
              pagetop.appendChild(separatorBest);
              pagetop.appendChild(bestLink);

          }

          // Create and append the "active" link if not on /active
          if (path !== '/active') {
              var activeLink = document.createElement('a');
              activeLink.href = 'active';
              activeLink.textContent = 'active';

              // Create the separator
              var separatorActive = document.createTextNode(' | ');

              // Append the separator and the new link
              pagetop.appendChild(separatorActive);
              pagetop.appendChild(activeLink);

          }

          // Disconnect the observer after modifications are done
          observer.disconnect();
      } else {
          console.log('Span with class pagetop not found');
      }
  }

  // Create a MutationObserver to watch for changes in the DOM
  var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
              modifyNav();
          }
      });
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });

  // Run the functions immediately in case the elements are already present
  addDarkTheme();
  modifyNav();
})();
