"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlock = void 0;
var prism_react_renderer_1 = require("prism-react-renderer");
var React = require("react");
(typeof global !== "undefined" ? global : window).Prism = prism_react_renderer_1.Prism;
// @ts-ignore
Promise.resolve().then(function () { return require("prismjs/components/prism-json"); });
var copy_1 = require("@/components/copy");
var clx_1 = require("@/utils/clx");
var CodeBlockContext = React.createContext(null);
var useCodeBlockContext = function () {
    var context = React.useContext(CodeBlockContext);
    if (context === null)
        throw new Error("useCodeBlockContext can only be used within a CodeBlockContext");
    return context;
};
/**
 * This component is based on the `div` element and supports all of its props
 */
var Root = function (_a) {
    var 
    /**
     * The code snippets.
     */
    snippets = _a.snippets, className = _a.className, children = _a.children, props = __rest(_a, ["snippets", "className", "children"]);
    var _b = React.useState(snippets[0]), active = _b[0], setActive = _b[1];
    return (<CodeBlockContext.Provider value={{ snippets: snippets, active: active, setActive: setActive }}>
      <div className={(0, clx_1.clx)("bg-ui-contrast-bg-base shadow-elevation-code-block flex flex-col overflow-hidden rounded-xl", className)} {...props}>
        {children}
      </div>
    </CodeBlockContext.Provider>);
};
Root.displayName = "CodeBlock";
/**
 * This component is based on the `div` element and supports all of its props
 */
var HeaderComponent = function (_a) {
    var children = _a.children, className = _a.className, 
    /**
     * Whether to hide the code snippets' labels.
     */
    _b = _a.hideLabels, 
    /**
     * Whether to hide the code snippets' labels.
     */
    hideLabels = _b === void 0 ? false : _b, props = __rest(_a, ["children", "className", "hideLabels"]);
    var _c = useCodeBlockContext(), snippets = _c.snippets, active = _c.active, setActive = _c.setActive;
    var tabRefs = React.useRef([]);
    var tabIndicatorRef = React.useRef(null);
    React.useEffect(function () {
        var activeTabRef = tabRefs.current.find(function (ref) { return (ref === null || ref === void 0 ? void 0 : ref.dataset.label) === active.label; });
        if (activeTabRef && tabIndicatorRef.current) {
            var activeTabIndex = tabRefs.current.indexOf(activeTabRef);
            var prevTabRef = activeTabIndex > 0 ? tabRefs.current[activeTabIndex - 1] : null;
            tabIndicatorRef.current.style.width = "".concat(activeTabRef.offsetWidth, "px");
            tabIndicatorRef.current.style.left = prevTabRef
                ? "".concat(tabRefs.current
                    .slice(0, activeTabIndex)
                    .reduce(function (total, tab) { return total + ((tab === null || tab === void 0 ? void 0 : tab.offsetWidth) || 0) + 12; }, 0) +
                    15, "px")
                : "15px";
        }
    }, [active]);
    return (<div>
      <div className={(0, clx_1.clx)("flex items-start px-4 pt-2.5", className)} {...props}>
        {!hideLabels &&
            snippets.map(function (snippet, idx) { return (<div className={(0, clx_1.clx)("text-ui-contrast-fg-secondary txt-compact-small-plus transition-fg relative cursor-pointer pb-[9px] pr-3", {
                    "text-ui-contrast-fg-primary cursor-default": active.label === snippet.label,
                })} key={snippet.label} onClick={function () { return setActive(snippet); }}>
              <span ref={function (ref) {
                    tabRefs.current[idx] = ref;
                    return undefined;
                }} data-label={snippet.label}>
                {snippet.label}
              </span>
            </div>); })}
        {children}
      </div>
      <div className="w-full px-0.5">
        <div className="bg-ui-contrast-border-top relative h-px w-full">
          <div ref={tabIndicatorRef} className={(0, clx_1.clx)("absolute bottom-0 transition-all motion-reduce:transition-none", "duration-150 ease-linear")}>
            <div className="bg-ui-contrast-fg-primary h-px rounded-full"/>
          </div>
        </div>
      </div>
    </div>);
};
HeaderComponent.displayName = "CodeBlock.Header";
/**
 * This component is based on the `div` element and supports all of its props
 */
var Meta = function (_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, clx_1.clx)("txt-compact-small text-ui-contrast-fg-secondary ml-auto", className)} {...props}/>);
};
Meta.displayName = "CodeBlock.Header.Meta";
var Header = Object.assign(HeaderComponent, { Meta: Meta });
/**
 * This component is based on the `div` element and supports all of its props
 */
var Body = function (_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    var active = useCodeBlockContext().active;
    var showToolbar = children || !active.hideCopy;
    return (<div>
      {showToolbar && (<div className="border-ui-contrast-border-bot flex min-h-10 items-center gap-x-3 border-t px-4 py-2">
          <div className="code-body text-ui-contrast-fg-secondary flex-1">
            {children}
          </div>
          {!active.hideCopy && (<copy_1.Copy content={active.code} className="text-ui-contrast-fg-secondary"/>)}
        </div>)}
      <div className="flex h-full flex-col overflow-hidden px-[5px] pb-[5px]">
        <div className={(0, clx_1.clx)("bg-ui-contrast-bg-subtle border-ui-contrast-border-bot relative h-full overflow-y-auto rounded-lg border p-4", className)} {...props}>
          <div className="max-w-[90%]">
            <prism_react_renderer_1.Highlight theme={__assign(__assign({}, prism_react_renderer_1.themes.palenight), { plain: {
                color: "rgba(249, 250, 251, 1)",
                backgroundColor: "var(--contrast-fg-primary)",
            }, styles: __spreadArray(__spreadArray([], prism_react_renderer_1.themes.palenight.styles, true), [
                {
                    types: ["keyword"],
                    style: {
                        fontStyle: "normal",
                        color: "rgb(187,160,255)",
                    },
                },
                {
                    types: ["punctuation", "operator"],
                    style: {
                        fontStyle: "normal",
                        color: "rgb(255,255,255)",
                    },
                },
                {
                    types: ["constant", "boolean"],
                    style: {
                        fontStyle: "normal",
                        color: "rgb(187,77,96)",
                    },
                },
                {
                    types: ["function"],
                    style: {
                        fontStyle: "normal",
                        color: "rgb(27,198,242)",
                    },
                },
                {
                    types: ["number"],
                    style: {
                        color: "rgb(247,208,25)",
                    },
                },
                {
                    types: ["property"],
                    style: {
                        color: "rgb(247,208,25)",
                    },
                },
                {
                    types: ["maybe-class-name"],
                    style: {
                        color: "rgb(255,203,107)",
                    },
                },
                {
                    types: ["string"],
                    style: {
                        color: "rgb(73,209,110)",
                    },
                },
                {
                    types: ["comment"],
                    style: {
                        color: "var(--contrast-fg-secondary)",
                        fontStyle: "normal",
                    },
                },
            ], false) })} code={active.code} language={active.language}>
              {function (_a) {
            var style = _a.style, tokens = _a.tokens, getLineProps = _a.getLineProps, getTokenProps = _a.getTokenProps;
            return (<pre className={(0, clx_1.clx)("code-body whitespace-pre-wrap bg-transparent", {
                    "grid grid-cols-[auto,1fr] gap-x-4": !active.hideLineNumbers,
                })} style={__assign(__assign({}, style), { background: "transparent" })}>
                  {!active.hideLineNumbers && (<div role="presentation" className="flex flex-col text-right">
                      {tokens.map(function (_, i) { return (<span key={i} className="text-ui-contrast-fg-secondary tabular-nums">
                          {i + 1}
                        </span>); })}
                    </div>)}
                  <div>
                    {tokens.map(function (line, i) { return (<div key={i} {...getLineProps({ line: line })}>
                        {line.map(function (token, key) { return (<span key={key} {...getTokenProps({ token: token })}/>); })}
                      </div>); })}
                  </div>
                </pre>);
        }}
            </prism_react_renderer_1.Highlight>
          </div>
        </div>
      </div>
    </div>);
};
Body.displayName = "CodeBlock.Body";
var CodeBlock = Object.assign(Root, { Body: Body, Header: Header, Meta: Meta });
exports.CodeBlock = CodeBlock;
