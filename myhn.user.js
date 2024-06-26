// ==UserScript==
// @name         myhackernews
// @namespace    https://github.com/jeanlucaslima/myhackernews/
// @version      2.5.0
// @description  Apply a dark theme to Hacker News and modify navigation links
// @license      MIT
// @copyright    jeanlucaslima
// @author       jeanlucaslima
// @homepageURL  https://github.com/jeanlucaslima/myhackernews/
// @supportURL   https://github.com/jeanlucaslima/myhackernews/issues
// @match        https://news.ycombinator.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Theme definitions
    const themes = {
        newDark: {
            '--background-color': '#1a202c',
            '--table-background-color': '#2d3848',
            '--text-color': '#dddddd',
            '--link-color': '#9facbe',
            '--pagetop-background-color': '#2d3848',
            '--pagetop-text-color': '#9facbe',
            '--hnname-color': '#bb86fc',
            '--title-link-color': '#ededed',
            '--title-link-visited-color': '#7fe0d4',
            '--subtext-link-color': '#c8d2dc',
            '--itemlist-even-bg-color': '#1c1c1c',
            '--itemlist-odd-bg-color': '#121212',
            '--c00-color': '#c8d2dc',
        },
        darkTheme: {
            '--background-color': '#1f1f1f',
            '--table-background-color': '#1f1f1f',
            '--text-color': '#e0e0e0',
            '--link-color': '#828282',
            '--pagetop-background-color': '#1f1f1f',
            '--pagetop-text-color': '#828282',
            '--hnname-color': '#bb86fc',
            '--title-link-color': '#ededed',
            '--title-link-visited-color': '#868686',
            '--subtext-link-color': '#03dac6',
            '--itemlist-even-bg-color': '#1c1c1c',
            '--itemlist-odd-bg-color': '#121212',
            '--c00-color': '#ededed',
        }
    };

    // Function to generate CSS rules from theme object
    function generateCSS(theme) {
        return `
            :root {
                color-scheme: ${theme.dark ? 'dark' : 'light'};
            }
            body, tbody {
                background-color: ${theme['--background-color']};
                color: ${theme['--text-color']};
            }
            a {
                color: ${theme['--link-color']};
            }
            a:link {
                color: ${theme['--link-color']};
            }
            .pagetop {
                background-color: ${theme['--pagetop-background-color']};
                padding: 0;
                color: ${theme['--pagetop-text-color']};
            }
            .pagetop a {
                color: ${theme['--pagetop-text-color']};
            }
            .pagetop a:visited {
                color: ${theme['--pagetop-text-color']};
            }
            .hnname a {
                color: ${theme['--hnname-color']};
            }
            td {
                background-color: ${theme['--table-background-color']};
            }
            td.title a {
                color: ${theme['--title-link-color']};
            }
            td.title a:visited {
                color: ${theme['--title-link-visited-color']};
            }
            .subtext a {
                color: ${theme['--subtext-link-color']};
            }
            .itemlist tr:nth-child(even) td {
                background-color: ${theme['--itemlist-even-bg-color']};
            }
            .itemlist tr:nth-child(odd) td {
                background-color: ${theme['--itemlist-odd-bg-color']};
            }
            table {
                background-color: ${theme['--table-background-color']} !important;
            }
            .c00, .c00 a:link { color: ${theme['--c00-color']}; }
        `;
    }

    // Function to apply the theme
    function applyTheme(themeName) {
        const theme = themes[themeName];
        const style = document.createElement('style');
        style.textContent = generateCSS(theme);
        document.head.appendChild(style);
    }

    // Function to remove links by href
    function removeLinkByHref(pagetop, href) {
        const link = pagetop.querySelector(`a[href="${href}"]`);
        if (link) {
            const separator = link.previousSibling;
            if (separator && separator.nodeType === Node.TEXT_NODE && separator.textContent.includes('|')) {
                pagetop.removeChild(separator);
            }
            pagetop.removeChild(link);
        }
    }

    // Function to create and append new link
    function createLink(pagetop, text, href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        pagetop.appendChild(document.createTextNode(' | '));
        pagetop.appendChild(link);
    }

    // Function to move the top menu to the bottom and add links
    function moveTopMenuToBottom(pagetop) {
        const yclinks = document.createElement('span');
        yclinks.className = 'yclinks';
        yclinks.innerHTML = pagetop.innerHTML;
        pagetop.innerHTML = '';

        const footer = document.createElement('div');
        footer.style.padding = '20px';
        footer.appendChild(yclinks);
        document.body.appendChild(footer);

        return yclinks;
    }

    // Function to add theme switcher
    function addThemeSwitcher(footer) {
        const themeSwitcher = document.createElement('select');
        themeSwitcher.innerHTML = `
            <option value="newDark">New Dark</option>
            <option value="darkTheme">Dark Theme</option>
        `;
        themeSwitcher.value = localStorage.getItem('hn-theme') || 'newDark';
        themeSwitcher.onchange = function() {
            localStorage.setItem('hn-theme', themeSwitcher.value);
            location.reload();
        };

        const themeSwitcherWrapper = document.createElement('span');
        themeSwitcherWrapper.style.display = 'block';
        themeSwitcherWrapper.style.marginTop = '10px';
        themeSwitcherWrapper.style.color = '#ededed';
        themeSwitcherWrapper.textContent = 'Select Theme: ';
        themeSwitcherWrapper.appendChild(themeSwitcher);
        footer.appendChild(themeSwitcherWrapper);
    }

    // Function to modify the navigation links
    function modifyNav() {
        const pagetop = document.querySelector('span.pagetop');
        if (pagetop) {
            removeLinkByHref(pagetop, 'submit');
            removeLinkByHref(pagetop, 'jobs');

            const yclinks = moveTopMenuToBottom(pagetop);
            const path = window.location.pathname;

            if (path !== '/best') createLink(yclinks, 'best', 'best');
            if (path !== '/active') createLink(yclinks, 'active', 'active');

            addThemeSwitcher(document.body.lastElementChild);
            observer.disconnect();
        }
    }

    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                modifyNav();
            }
        });
    });

    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Apply the saved theme or default to newDark
    const savedTheme = localStorage.getItem('hn-theme') || 'newDark';
    applyTheme(savedTheme);
    modifyNav();
})();
