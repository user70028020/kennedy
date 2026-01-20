/* empty css                                                      */
function ToastContainer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    ToastContainer($$renderer2);
    $$renderer2.push(`<!----> `);
    children($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
export {
  _layout as default
};
