What is Pelican?
################

:date: 2015-12-14
:tags: Pelican
:category: Pelican
:slug: what-is-pelican
:authors: Élysson MR

Pelican is a static site generator, written in `Python <www.python.org>`_, that requires no database or server-side logic. Contents are written using `reStructuredText <http://docutils.sourceforge.net/rst.html>`_, `Markdown <http://daringfireball.net/projects/markdown/>`_ (requires additional libriries) or `AsciiDoc <http://www.methods.co.nz/asciidoc/>`_ formats.

.. more

Advantages of using pelican:

- Generate static site running just one command to easy host anywhere (its output is just static files).
- You can choose one of theme in `theme collection <https://github.com/getpelican/pelican-themes>`_, personalize it or create your own theme using `Jinja <http://jinja.pocoo.org/>`_ templates.
- Generated site can be published in many languages.
- Generates atom/RSS feeds.
- Developer blog? Use a code syntax highlight on your publications.
- Migrations tools to import contents from WordPress, Dotclear, RSS Feed and some other services.
- Many `plugins <https://github.com/getpelican/pelican-plugins>`_ to enchance site experience.

And many other things...

Installation
============

Pelican can be installed using pip. Just run:

.. code-block:: shell

    pip install pelican markdown

Some plugins requires additional packages read their documentation to find out what should be installed too.

Starting a Pelican Site
=======================

First, create a directory for the project, remmember to choose a apropriate name:

.. code-block:: shell

    mkdir -p ~/projects/pelican-powered-site
    cd ~/projects/pelican-powered-site

To create project's skeleton run pelican's quickstart command:

.. code-block:: shell

    pelican-quickstart

Some questions are going to ask to pre-configure the site.

Creating a Article
==================

Before run pelican we need to ad some content to our site. Using one text editor wite this down:

.. code-block:: shell

    Title: My First Review
    Date: 2010-12-03 10:20
    Category: Review

    Following is a review of my favorite mechanical keyboard.

The example article is written in Markdown syntax. Save the file in:

.. code-block:: shell

    ~/projects/pelican-powered-site/content/keyboard-review.md

Generating and running the site
===============================

From the site's directory run this command to generate our site:

.. code-block:: shell

    pelican content

After the command end all site files has been generated inside "output" folder. To preview it execute:

.. code-block:: shell

    cd ~/projects/pelican-powered-site/output
    python -m pelican.server

That's all Folks!! Now we got a static site generated with one simple article.

For more information read `pelican's documentation <http://docs.getpelican.com/en/3.6.3/index.html>`_ and check its `community tutorials <https://github.com/getpelican/pelican/wiki/Tutorials>`_. This article content is based in pelican's `quickstart <http://docs.getpelican.com/en/3.6.3/quickstart.html>`_ article.

----

**References:**
---------------

`Pelican <http://blog.getpelican.com/>`_

`Markdown <http://daringfireball.net/projects/markdown/>`_

`Pelican's Documentation <http://docs.getpelican.com/en/3.6.3/index.html>`_

`Pelican's Tutorials <https://github.com/getpelican/pelican/wiki/Tutorials>`_

`Pelican's Plugins <https://github.com/getpelican/pelican-plugins>`_
