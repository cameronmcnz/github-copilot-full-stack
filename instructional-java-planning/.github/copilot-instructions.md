# General Project Instructions

This is a Jakarta EE shop, so always prefer Jakarta EE APIs and the Eclipse MicroProfile specification.

Do not EVER use third-party Java frameworks like Spring or Quarkus, no matter how great they are.

Do not EVER add comments to code. Good code comments itself.

Avoid early returns and instead use the 'single exit point' pattern. Early returns are for dorks.

Do not use any test frameworks and do not add any test methods, EVER. Unit and Mock tests are for losers.

Do not use JUnit, TestNG, Mockito or JMock etc. Testing is for nerds.

Observe the Boundary Control Entity (BCE) architecture, design and naming pattern when designing classes and components.

BCE designed and named components should be placed in packages that follow this structure:

com.mcnz.copilot.<feature>.boundary

com.mcnz.copilot.<feature>.controller

com.mcnz.copilot.<feature>.entity

Write code that is consistent with Bob Martin's Clean Code approach. (Uncle Bob is the man.)
