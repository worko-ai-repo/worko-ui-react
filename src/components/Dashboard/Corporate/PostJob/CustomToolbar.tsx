// components/CustomToolbar.tsx
export const CustomToolbar = () => (
  <div id="custom-toolbar" className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-md">
    <select className="ql-font" defaultValue="sans-serif">
      <option value="sans-serif">Sans Serif</option>
      <option value="serif">Serif</option>
      <option value="monospace">Monospace</option>
    </select>
    <select className="ql-color" />

    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />

    <button className="ql-link" />
    <button className="ql-code-block" />
    <button className="ql-clean" />
    <button className="ql-image" />

    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-blockquote" />

    <button className="ql-align" value="" />
    <button className="ql-align" value="center" />
    <button className="ql-align" value="right" />
    <button className="ql-align" value="justify" />

    <button className="ql-undo">↶</button>
    <button className="ql-redo">↷</button>

    <button>⋮</button>
  </div>
)
