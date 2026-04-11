import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as o}from"./index-BxY4JGwq.js";import{M as s}from"./Modal-CNp-XRAE.js";import{B as n}from"./Button-BNyMHqOH.js";import{I as f}from"./Input-CXeQQ0Y4.js";import"./_commonjsHelpers-CqkleIqs.js";import"./clsx-B-dksMZM.js";/* empty css              */import"./x-lWMTmhcP.js";import"./createLucideIcon-DA4OzSxG.js";/* empty css               *//* empty css              */const v={title:"Components/Modal",component:s,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg","xl","full"]}}},l={render:()=>{const[t,r]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>r(!0),children:"Open Modal"}),e.jsx(s,{isOpen:t,onClose:()=>r(!1),title:"Default Modal",children:e.jsx("p",{children:"This is the modal content. Press ESC or click outside to close."})})]})}},a={render:()=>{const[t,r]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>r(!0),children:"Open"}),e.jsx(s,{isOpen:t,onClose:()=>r(!1),title:"Confirm Action",description:"This action cannot be undone.",children:e.jsx("p",{children:"Are you sure you want to proceed?"})})]})}},i={render:()=>{const[t,r]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>r(!0),children:"Open"}),e.jsx(s,{isOpen:t,onClose:()=>r(!1),title:"Edit Profile",footer:e.jsxs("div",{style:{display:"flex",gap:"0.5rem",justifyContent:"flex-end"},children:[e.jsx(n,{variant:"ghost",onClick:()=>r(!1),children:"Cancel"}),e.jsx(n,{onClick:()=>r(!1),children:"Save"})]}),children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx(f,{label:"Name",placeholder:"Enter your name"}),e.jsx(f,{label:"Email",placeholder:"Enter your email",type:"email"})]})})]})}},c={render:()=>{const[t,r]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>r(!0),children:"Small Modal"}),e.jsx(s,{isOpen:t,onClose:()=>r(!1),title:"Small",size:"sm",children:e.jsx("p",{children:"A compact modal for quick confirmations."})})]})}},p={render:()=>{const[t,r]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>r(!0),children:"Large Modal"}),e.jsxs(s,{isOpen:t,onClose:()=>r(!1),title:"Large Modal",size:"lg",children:[e.jsx("p",{children:"A spacious modal for complex content with multiple sections."}),e.jsx("div",{style:{marginTop:"1rem",padding:"1rem",background:"var(--color-surface-muted, #f1f5f9)",borderRadius:"0.5rem"},children:e.jsx("p",{children:"Additional content area for forms, tables, or detailed information."})})]})]})}},d={render:()=>{const[t,r]=o.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(n,{onClick:()=>r(!0),children:"No Close Button"}),e.jsx(s,{isOpen:t,onClose:()=>r(!1),title:"Required Action",showCloseButton:!1,closeOnOverlayClick:!1,closeOnEsc:!1,footer:e.jsx(n,{onClick:()=>r(!1),fullWidth:!0,children:"I Understand"}),children:e.jsx("p",{children:"This modal requires the user to take an explicit action to close it."})})]})}},u={render:()=>{const[t,r]=o.useState(null);return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"flex",gap:"0.5rem",flexWrap:"wrap"},children:["sm","md","lg","xl","full"].map(m=>e.jsx(n,{variant:"outline",size:"sm",onClick:()=>r(m),children:m.toUpperCase()},m))}),t&&e.jsx(s,{isOpen:!0,onClose:()=>r(null),title:`Size: ${t}`,size:t,children:e.jsxs("p",{children:["Modal with size ",e.jsx("strong",{children:t}),"."]})})]})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Open Modal</Button>\r
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Default Modal">\r
          <p>This is the modal content. Press ESC or click outside to close.</p>\r
        </Modal>\r
      </>;
  }
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Open</Button>\r
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm Action" description="This action cannot be undone.">\r
          <p>Are you sure you want to proceed?</p>\r
        </Modal>\r
      </>;
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Open</Button>\r
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Profile" footer={<div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'flex-end'
      }}>\r
              <Button variant="ghost" onClick={() => setOpen(false)}>\r
                Cancel\r
              </Button>\r
              <Button onClick={() => setOpen(false)}>Save</Button>\r
            </div>}>\r
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>\r
            <Input label="Name" placeholder="Enter your name" />\r
            <Input label="Email" placeholder="Enter your email" type="email" />\r
          </div>\r
        </Modal>\r
      </>;
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Small Modal</Button>\r
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Small" size="sm">\r
          <p>A compact modal for quick confirmations.</p>\r
        </Modal>\r
      </>;
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Large Modal</Button>\r
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Large Modal" size="lg">\r
          <p>A spacious modal for complex content with multiple sections.</p>\r
          <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--color-surface-muted, #f1f5f9)',
          borderRadius: '0.5rem'
        }}>\r
            <p>Additional content area for forms, tables, or detailed information.</p>\r
          </div>\r
        </Modal>\r
      </>;
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>No Close Button</Button>\r
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Required Action" showCloseButton={false} closeOnOverlayClick={false} closeOnEsc={false} footer={<Button onClick={() => setOpen(false)} fullWidth>\r
              I Understand\r
            </Button>}>\r
          <p>This modal requires the user to take an explicit action to close it.</p>\r
        </Modal>\r
      </>;
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
    return <>\r
        <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>\r
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(s => <Button key={s} variant="outline" size="sm" onClick={() => setSize(s)}>\r
              {s.toUpperCase()}\r
            </Button>)}\r
        </div>\r
        {size && <Modal isOpen onClose={() => setSize(null)} title={\`Size: \${size}\`} size={size}>\r
            <p>\r
              Modal with size <strong>{size}</strong>.\r
            </p>\r
          </Modal>}\r
      </>;
  }
}`,...u.parameters?.docs?.source}}};const E=["Default","WithDescription","WithFooter","Small","Large","NoCloseButton","AllSizes"];export{u as AllSizes,l as Default,p as Large,d as NoCloseButton,c as Small,a as WithDescription,i as WithFooter,E as __namedExportsOrder,v as default};
