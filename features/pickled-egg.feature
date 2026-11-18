# features/pickled-egg.feature
# Source: le.seo/src/lib/self-card.json, src/lib/palette.json, scripts/manifest.mjs,
#         scripts/icons.mjs, index.html, scripts/verify-publish.mjs.
# The reference implementation is this repository: /le.seo/manifest.json and
# /le.seo/icons/ are generated on every build.
#
# pickled-egg is one preserved item in a labelled jar — the label is the point.
# That is the shape of the procedure: install metadata that names the seed it
# belongs to, generated from the seed's own sources, and refused when it does
# not. le.seo introduces this isotope and proposes it for isotope/features/.
#
# 42i-marker: +42
@isotope @manifest @install
Feature: Install metadata names the seed it came from
  As someone shipping a seed that can be installed
  I want the app title, theme and icons to come from the seed's own sources
  So that a copied manifest cannot describe somebody else's seed

  Scenario: the app title names the seed
    Given a seed card that gives its name and its preferred name
    When the manifest is generated
    Then the manifest's name begins with the seed's name
    And the manifest's short name is the preferred name

  Scenario: the description is the card's sentence
    Given a seed card that carries one description
    When the manifest is generated
    Then the manifest's description is that same sentence

  Scenario: the theme is the wall
    Given a palette that declares the wall as a token
    When the manifest is generated
    Then the theme colour is the wall
    And the background colour is the wall

  Scenario: the first frame paints the wall before the stylesheet
    Given the wall is a declared token
    When the document is served
    Then the document declares the wall as its theme colour
    And the document paints the wall before any stylesheet is fetched

  Scenario: every icon is a drawn file at the size it claims
    When the icons are drawn
    Then every icon the manifest names exists
    And every icon's pixels match its declared size
    And the maskable icon is declared maskable

  Scenario: the tab mark is drawn from the palette and says the seed's name
    When the tab mark is drawn
    Then its accessible name is the seed's name
    And every colour in it is a palette token

  Scenario: a shortcut is a shelf, not a route
    Given a shortcut that names a tree
    When the manifest is generated
    Then the shortcut is relative to the manifest
    And the shortcut resolves to a prerendered page

  Scenario: a palette copied from another seed is refused
    Given a document that still paints another seed's colour
    When the guard reads the built page
    Then the build stops
