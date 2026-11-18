# features/giardiniera.feature
# Source: le.seo/src/lib/tree.ts — tree, treeRecord, treePath, LINKS.
# The page at https://james-gibson.github.io/le.seo/ is the reference implementation.
#
# giardiniera is a mixed pickle — several vegetables in one jar, each still
# recognisable. That is the shape of the procedure: an assortment chosen for one
# voice and one goal, served in one order, never a bag of everything.
#
# le.seo introduces this isotope and proposes it for isotope/features/.
# 42i-marker: +42
@isotope @pitch @tree
Feature: A link tree serves one voice and one goal
  As someone promoting a collection of seeds
  I want a short ordered set of destinations chosen for one reader and one purpose
  So that a pitch says something rather than listing everything

  Scenario: an exact tree keeps only the links that answer both questions
    Given a register with a link that is for the reader and for trying
    And a link that is for the maintainer and for verifying
    When a tree is built for the reader and for trying
    Then the tree holds the first link
    And the tree does not hold the second link
    And the tree's basis is exact

  Scenario: a tree falls back to the voice when no link answers the goal
    Given a register whose only link is for the packager and for adopting
    When a tree is built for the packager and for funding
    Then the tree holds the link
    And the tree's basis is voice

  Scenario: a tree falls back to the whole register when the voice has nothing either
    Given a register whose only link is for the maintainer
    When a tree is built for the grower and for funding
    Then the tree holds the link
    And the tree's basis is all

  Scenario: a tree is never empty
    Given a register with at least one link
    When a tree is built for any voice and any goal
    Then the tree holds at least one link

  Scenario: a tree is ordered by readiness and then by name
    Given two links a reader could open, at rung 3 and at rung 1
    When a tree is built for the reader
    Then the rung 1 link comes first
    And two links at the same rung are ordered by name

  Scenario: a tree never repeats a destination
    Given a register of twelve links
    When a tree is built for the reader and for trying
    Then no link appears twice in the tree

  Scenario: one destination may serve two trees
    Given a link that is for the reader and for the grower
    When a tree is built for the reader
    And a tree is built for the grower
    Then the link appears in both trees

  Scenario: the same record pitches a project as well as a seed
    Given a link whose kind is project
    When a tree is built that includes it
    Then the tree holds the project
    And the rules of the tree do not change with its kind

  Scenario: a tree published twice is the same tree
    Given a tree for the reader and for trying
    When its record is serialised twice
    Then the two records are identical
    And the record carries the voice and the goal

  Scenario: a tree address carries both values
    Given the reader and the trying goal
    When the address is built and read back
    Then the address names the reader
    And the address names the trying goal
