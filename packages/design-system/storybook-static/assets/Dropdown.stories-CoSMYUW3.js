import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as m}from"./index-BxY4JGwq.js";import{c}from"./clsx-B-dksMZM.js";/* empty css                 */import{C as b}from"./chevron-down-BS89M68v.js";import{U as N}from"./user-DdIXiGSf.js";import{S}from"./settings-CG7BJskn.js";import{c as C}from"./createLucideIcon-DA4OzSxG.js";import{T as E}from"./trash-2-DwMhtAJX.js";import{B as L}from"./Button-BNyMHqOH.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css               */const T=C("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]),A=m.createContext(null);function v(){const r=m.useContext(A);if(!r)throw new Error("Dropdown components must be used within a Dropdown provider");return r}function i({align:r="start",className:t,children:s,...a}){const[n,d]=m.useState(!1),D=m.useRef(null),y=()=>d(!1);return m.useEffect(()=>{const p=I=>{D.current&&!D.current.contains(I.target)&&d(!1)};return n&&document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[n]),m.useEffect(()=>{const p=I=>{I.key==="Escape"&&d(!1)};return n&&document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[n]),e.jsx(A.Provider,{value:{isOpen:n,setIsOpen:d,close:y},children:e.jsx("div",{ref:D,className:c("ds-dropdown",`ds-dropdown--${r}`,t),...a,children:s})})}function l({showArrow:r=!0,className:t,children:s,...a}){const{isOpen:n,setIsOpen:d}=v();return e.jsxs("button",{type:"button",className:c("ds-dropdown__trigger",n&&"ds-dropdown__trigger--open",t),onClick:()=>d(!n),"aria-expanded":n?"true":"false","aria-haspopup":"menu",...a,children:[s,r&&e.jsx(b,{size:16,className:c("ds-dropdown__arrow",n&&"ds-dropdown__arrow--open")})]})}function u({className:r,children:t,...s}){const{isOpen:a}=v();return a?e.jsx("div",{className:c("ds-dropdown__menu",r),role:"menu",...s,children:t}):null}function o({icon:r,destructive:t=!1,className:s,children:a,onClick:n,...d}){const{close:D}=v(),y=p=>{n?.(p),D()};return e.jsxs("button",{type:"button",className:c("ds-dropdown__item",t&&"ds-dropdown__item--destructive",s),role:"menuitem",onClick:y,...d,children:[r&&e.jsx("span",{className:"ds-dropdown__item-icon",children:r}),e.jsx("span",{className:"ds-dropdown__item-text",children:a})]})}function w({className:r,...t}){return e.jsx("div",{className:c("ds-dropdown__separator",r),role:"separator",...t})}function g({className:r,children:t,...s}){return e.jsx("div",{className:c("ds-dropdown__label",r),...s,children:t})}try{i.displayName="Dropdown",i.__docgenInfo={description:"",displayName:"Dropdown",props:{align:{defaultValue:{value:"start"},description:"Alinhamento do menu",name:"align",required:!1,type:{name:"enum",value:[{value:'"start"'},{value:'"end"'},{value:'"center"'}]}}}}}catch{}try{l.displayName="DropdownTrigger",l.__docgenInfo={description:"",displayName:"DropdownTrigger",props:{showArrow:{defaultValue:{value:"true"},description:"Mostrar seta",name:"showArrow",required:!1,type:{name:"boolean"}}}}}catch{}try{u.displayName="DropdownMenu",u.__docgenInfo={description:"",displayName:"DropdownMenu",props:{}}}catch{}try{o.displayName="DropdownItem",o.__docgenInfo={description:"",displayName:"DropdownItem",props:{icon:{defaultValue:null,description:"Ícone opcional",name:"icon",required:!1,type:{name:"ReactNode"}},destructive:{defaultValue:{value:"false"},description:"Item destrutivo (vermelho)",name:"destructive",required:!1,type:{name:"boolean"}}}}}catch{}try{w.displayName="DropdownSeparator",w.__docgenInfo={description:"",displayName:"DropdownSeparator",props:{}}}catch{}try{g.displayName="DropdownLabel",g.__docgenInfo={description:"",displayName:"DropdownLabel",props:{}}}catch{}const $={title:"Components/Dropdown",component:i,tags:["autodocs"],argTypes:{align:{control:"select",options:["start","end","center"]}}},x={render:()=>e.jsxs(i,{children:[e.jsx(l,{children:"Options"}),e.jsxs(u,{children:[e.jsx(o,{children:"Edit"}),e.jsx(o,{children:"Duplicate"}),e.jsx(w,{}),e.jsx(o,{destructive:!0,children:"Delete"})]})]})},h={render:()=>e.jsxs(i,{children:[e.jsx(l,{children:"My Account"}),e.jsxs(u,{children:[e.jsx(g,{children:"Account"}),e.jsx(o,{icon:e.jsx(N,{size:16}),children:"Profile"}),e.jsx(o,{icon:e.jsx(S,{size:16}),children:"Settings"}),e.jsx(w,{}),e.jsx(o,{icon:e.jsx(T,{size:16}),destructive:!0,children:"Logout"})]})]})},_={render:()=>e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsxs(i,{align:"end",children:[e.jsx(l,{children:"Align End"}),e.jsxs(u,{children:[e.jsx(o,{children:"Option A"}),e.jsx(o,{children:"Option B"}),e.jsx(o,{children:"Option C"})]})]})})},f={render:()=>e.jsxs(i,{children:[e.jsx(l,{children:"Actions"}),e.jsxs(u,{children:[e.jsx(g,{children:"Navigation"}),e.jsx(o,{children:"Dashboard"}),e.jsx(o,{children:"Reports"}),e.jsx(w,{}),e.jsx(g,{children:"Admin"}),e.jsx(o,{icon:e.jsx(N,{size:16}),children:"Users"}),e.jsx(o,{icon:e.jsx(S,{size:16}),children:"Config"}),e.jsx(w,{}),e.jsx(o,{icon:e.jsx(E,{size:16}),destructive:!0,children:"Delete All"})]})]})},j={render:()=>e.jsxs(i,{children:[e.jsx(l,{showArrow:!1,children:e.jsx(L,{variant:"outline",size:"sm",children:"⋮"})}),e.jsxs(u,{children:[e.jsx(o,{children:"Edit"}),e.jsx(o,{children:"Share"}),e.jsx(o,{destructive:!0,children:"Remove"})]})]})};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Dropdown>\r
      <DropdownTrigger>Options</DropdownTrigger>\r
      <DropdownMenu>\r
        <DropdownItem>Edit</DropdownItem>\r
        <DropdownItem>Duplicate</DropdownItem>\r
        <DropdownSeparator />\r
        <DropdownItem destructive>Delete</DropdownItem>\r
      </DropdownMenu>\r
    </Dropdown>
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Dropdown>\r
      <DropdownTrigger>My Account</DropdownTrigger>\r
      <DropdownMenu>\r
        <DropdownLabel>Account</DropdownLabel>\r
        <DropdownItem icon={<User size={16} />}>Profile</DropdownItem>\r
        <DropdownItem icon={<Settings size={16} />}>Settings</DropdownItem>\r
        <DropdownSeparator />\r
        <DropdownItem icon={<LogOut size={16} />} destructive>\r
          Logout\r
        </DropdownItem>\r
      </DropdownMenu>\r
    </Dropdown>
}`,...h.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    justifyContent: 'flex-end'
  }}>\r
      <Dropdown align="end">\r
        <DropdownTrigger>Align End</DropdownTrigger>\r
        <DropdownMenu>\r
          <DropdownItem>Option A</DropdownItem>\r
          <DropdownItem>Option B</DropdownItem>\r
          <DropdownItem>Option C</DropdownItem>\r
        </DropdownMenu>\r
      </Dropdown>\r
    </div>
}`,..._.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Dropdown>\r
      <DropdownTrigger>Actions</DropdownTrigger>\r
      <DropdownMenu>\r
        <DropdownLabel>Navigation</DropdownLabel>\r
        <DropdownItem>Dashboard</DropdownItem>\r
        <DropdownItem>Reports</DropdownItem>\r
        <DropdownSeparator />\r
        <DropdownLabel>Admin</DropdownLabel>\r
        <DropdownItem icon={<User size={16} />}>Users</DropdownItem>\r
        <DropdownItem icon={<Settings size={16} />}>Config</DropdownItem>\r
        <DropdownSeparator />\r
        <DropdownItem icon={<Trash2 size={16} />} destructive>\r
          Delete All\r
        </DropdownItem>\r
      </DropdownMenu>\r
    </Dropdown>
}`,...f.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Dropdown>\r
      <DropdownTrigger showArrow={false}>\r
        <Button variant="outline" size="sm">\r
          ⋮\r
        </Button>\r
      </DropdownTrigger>\r
      <DropdownMenu>\r
        <DropdownItem>Edit</DropdownItem>\r
        <DropdownItem>Share</DropdownItem>\r
        <DropdownItem destructive>Remove</DropdownItem>\r
      </DropdownMenu>\r
    </Dropdown>
}`,...j.parameters?.docs?.source}}};const F=["Default","WithIcons","AlignEnd","WithSections","CustomTrigger"];export{_ as AlignEnd,j as CustomTrigger,x as Default,h as WithIcons,f as WithSections,F as __namedExportsOrder,$ as default};
