import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as y}from"./index-BxY4JGwq.js";import{I as r}from"./Input-CXeQQ0Y4.js";import{S as w}from"./search-B4MFFvlx.js";import{M as x}from"./mail-BelTTDqz.js";import{c as h}from"./createLucideIcon-DA4OzSxG.js";import"./_commonjsHelpers-CqkleIqs.js";import"./clsx-B-dksMZM.js";/* empty css              */const b=h("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);const f=h("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),v={title:"Components/Input",component:r,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}},a={args:{placeholder:"Enter text..."}},s={args:{label:"Email",placeholder:"Enter your email",type:"email"}},o={args:{label:"Password",type:"password",helperText:"Must be at least 8 characters"}},t={args:{label:"Email",type:"email",defaultValue:"invalid-email",error:"Please enter a valid email address"}},l={args:{placeholder:"Search...",leftIcon:e.jsx(w,{size:18})}},n={args:{label:"Email",placeholder:"Enter your email",rightIcon:e.jsx(x,{size:18})}},c={args:{label:"Disabled Input",placeholder:"Cannot edit",disabled:!0}},i={args:{placeholder:"Small input",size:"sm"}},d={args:{placeholder:"Large input",size:"lg"}},p={render:function(){const[u,g]=y.useState(!1);return e.jsx(r,{label:"Password",type:u?"text":"password",placeholder:"Enter password",rightIcon:e.jsx("button",{type:"button",onClick:()=>g(!u),style:{background:"none",border:"none",cursor:"pointer",padding:0},children:u?e.jsx(b,{size:18}):e.jsx(f,{size:18})})})}},m={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem",width:"300px"},children:[e.jsx(r,{size:"sm",placeholder:"Small"}),e.jsx(r,{size:"md",placeholder:"Medium"}),e.jsx(r,{size:"lg",placeholder:"Large"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text...'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email'
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Must be at least 8 characters'
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'invalid-email',
    error: 'Please enter a valid email address'
  }
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Search...',
    leftIcon: <Search size={18} />
  }
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    rightIcon: <Mail size={18} />
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Small input',
    size: 'sm'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Large input',
    size: 'lg'
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: function PasswordToggleExample() {
    const [showPassword, setShowPassword] = useState(false);
    return <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Enter password" rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }}>\r
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}\r
          </button>} />;
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '300px'
  }}>\r
      <Input size="sm" placeholder="Small" />\r
      <Input size="md" placeholder="Medium" />\r
      <Input size="lg" placeholder="Large" />\r
    </div>
}`,...m.parameters?.docs?.source}}};const D=["Default","WithLabel","WithHelper","WithError","WithLeftIcon","WithRightIcon","Disabled","Small","Large","PasswordToggle","AllSizes"];export{m as AllSizes,a as Default,c as Disabled,d as Large,p as PasswordToggle,i as Small,t as WithError,o as WithHelper,s as WithLabel,l as WithLeftIcon,n as WithRightIcon,D as __namedExportsOrder,v as default};
