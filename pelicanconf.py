#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals


AUTHOR = u'\xc9lysson MR'
SITENAME = u'\xc9lysson MR'
SITESUBTITLE = 'My Personal Blog'
SITETAG = 'Let\'s Talk About Some Stuff :)'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'America/Sao_Paulo'

DEFAULT_LANG = u'en'
LANG = u'en_US.UTF-8'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Static
STATIC_PATHS = ['images', 'extra']
EXTRA_PATH_METADATA = {'extra/CNAME': {'path': 'CNAME'},
                       'extra/favicon.ico': {'path': 'favicon.ico'},
                       'extra/googleverification': {
                           'path': 'google21a3e67c56fd4d82.html'}}

# Blogroll
LINKS = ()

# Social widget
SOCIAL = (('Facebook', 'http://facebook.com/elyssonmr',
           'fa fa-facebook-square fa-fw fa-lg'),
          ('Google+', 'https://plus.google.com/+ÉlyssonMendesRezende',
            'fa fa-google-plus-square fa-fw fa-lg'),
           ('Twitter', 'http://twitter.com/elyssonmr',
            'fa fa-twitter-square fa-fw fa-lg'),
           ('LinkedIn', 'https://www.linkedin.com/in/elyssonmr',
            'fa fa-linkedin-square fa-fw fa-lg'),
           ('GitHub', 'https://github.com/elyssonmr',
            'fa fa-github-square fa-fw fa-lg'),)

DEFAULT_PAGINATION = 10

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

# Comments config
DISQUS_SITENAME = 'elyssonmr'

# Analytics
GOOGLE_ANALYTICS = 'UA-49815718-3'

# Plugins
PLUGIN_PATHS = ['plugins']
PLUGINS = ['summary', 'feed_summary', 'tag_cloud']

# Summary Config
SUMMARY_END_MARKER = '<!-- more -->'

# theme Configs
THEME = 'theme/voidy-bootstrap'
STYLESHEET_FILES = ("pygment.css", "voidybootstrap.css",)
CUSTOM_ARTICLE_FOOTERS = ("taglist.html", "sharing.html", )
CUSTOM_SCRIPTS_ARTICLE = "sharing_scripts.html"
SIDEBAR = "sidebar.html"
DISPLAY_SEARCH_FORM = True
TWITTER_USERNAME = 'elyssonmr'
DISPLAY_CATEGORIES_ON_SUBMENU = True
DISPLAY_CATEGORIES_ON_MENU = False
DISPLAY_CATEGORIES_ON_POSTINFO = True
DISPLAY_AUTHOR_ON_POSTINFO = True
DISPLAY_PAGES_ON_MENU = True

# tag Cloud
TAG_CLOUD_SORTING = 'size'
