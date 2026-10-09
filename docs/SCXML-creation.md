# SCXML File Creation Guide for Interacto

This document defines strict rules for generating SCXML files to ensure compatibility with analysis tools and adherence to project standards.

## 1. Standard and Format
- **Standard**: W3C SCXML 1.0.
- **Datamodel Language**: ECMAScript.
- **Documentation**: No comments or documentation should be present inside the XML file.

## 2. Variable Management and Assignments
The `name` attribute is forbidden. Use `location` exclusively.

### Path Syntax
To avoid security errors ("unsafe") in certain tools:
- ❌ **Forbidden**: `location="$.variable"` (root prefix)
- ❌ **Forbidden**: `location="./variable"` (relative prefix)
- ❌ **Forbidden**: `location="/variable"` (absolute prefix)
- ✅ **Mandatory**: `location="variable"` (direct variable name)

**Example:**
```xml
<assign location="firstX" expr="event.data.clientX" />
```

## 3. Guards and Predicates (Conditions)
Logic code must never be written inline within the `cond` attribute of a transition.

- ❌ **Forbidden**: `<transition cond="x > 10" ... />`
- ✅ **Mandatory**: Define the predicate in the `<datamodel>` and use its `id` in the transition.

**Example:**
```xml
<datamodel>
  <data id="isTooFar" expr="Math.abs(firstX - event.data.clientX) > tolerance" />
</datamodel>

<transition event="mousemove" target="moved" cond="isTooFar" />
```

## 4. Timing and Durations
Delays must not use variables and must follow the ISO 8601 format.

- ❌ **Forbidden**: `<send delay="timeGap" ... />` (where timeGap = 300)
- ✅ **Mandatory**: `<send delay="PT0.3S" ... />` (for 300ms)

## 5. State Structure
### Initial State
The initial state must be a real state (`<state>`) and not an empty `<initial>` element.
- ✅ **Mandatory**: Use the `initial` attribute in the root `<scxml>` tag.

**Example:**
```xml
<scxml initial="initState" ...>
  <state id="initState">
    <!-- content -->
  </state>
</scxml>
```

### Terminal States
Use the `<final id="name" />` tag.

## 6. Minimalism and Content
To keep files lightweight and focused on state logic:
- **No Logs**: Do not add `<log>` tags in `onentry` or `onexit` (especially for `onTerminating` or `onCancelling`).
- **No Callbacks**: Do not include `<invoke type="callback" ... />` calls or external actions within the SCXML flow.

## 7. Reference Example (Golden Sample)
Follow this typical structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" name="ExampleFSM" initial="initState">
  <datamodel>
    <data id="tolerance" expr="10" />
    <data id="firstX" expr="0" />
    <!-- Predicate -->
    <data id="isTooFar" expr="Math.abs(firstX - event.data.clientX) > tolerance" />
  </datamodel>
  
  <state id="initState">
    <transition event="mousedown" target="down">
      <assign location="firstX" expr="event.data.clientX" />
    </transition>
  </state>
  
  <state id="down">
    <transition event="mousemove" target="cancelled" cond="isTooFar" />
    <transition event="mouseup" target="completed" />
  </state>
  
  <final id="completed" />
  <final id="cancelled" />
</scxml>
```
