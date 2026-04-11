import{j as a}from"./jsx-runtime-CSjhXfFz.js";import"./index-BxY4JGwq.js";import{c as x}from"./clsx-B-dksMZM.js";import{U as f}from"./user-DdIXiGSf.js";import"./_commonjsHelpers-CqkleIqs.js";import"./createLucideIcon-DA4OzSxG.js";function _(r){const s=r.trim().split(/\s+/);return s.length>=2?`${s[0][0]}${s[1][0]}`:s[0]?.substring(0,2)||"?"}function e({src:r,alt:s,name:t,size:g="md",shape:c="circle",fallback:h,className:i,...A}){return a.jsx("div",{className:x("ds-avatar",`ds-avatar--${g}`,c==="square"&&"ds-avatar--square",i),role:"img","aria-label":s||t||"Avatar",...A,children:r?a.jsx("img",{className:"ds-avatar__image",src:r,alt:s||t||"Avatar"}):t?a.jsx("span",{className:"ds-avatar__initials",children:_(t)}):h||a.jsx("span",{className:"ds-avatar__initials",children:"?"})})}function v({max:r,className:s,children:t,...g}){const c=Array.isArray(t)?t:[t],h=r?c.slice(0,r):c,i=r?c.length-r:0;return a.jsxs("div",{className:x("ds-avatar-group",s),...g,children:[i>0&&a.jsx("div",{className:"ds-avatar ds-avatar--md","aria-label":`+${i} more`,children:a.jsxs("span",{className:"ds-avatar__initials",children:["+",i]})}),[...h].reverse()]})}try{e.displayName="Avatar",e.__docgenInfo={description:"",displayName:"Avatar",props:{src:{defaultValue:null,description:"URL da imagem",name:"src",required:!1,type:{name:"string"}},alt:{defaultValue:null,description:"Texto alternativo",name:"alt",required:!1,type:{name:"string"}},name:{defaultValue:null,description:"Nome para gerar iniciais como fallback",name:"name",required:!1,type:{name:"string"}},size:{defaultValue:{value:"md"},description:"Tamanho",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'},{value:'"xl"'},{value:'"xs"'}]}},shape:{defaultValue:{value:"circle"},description:"Formato",name:"shape",required:!1,type:{name:"enum",value:[{value:'"circle"'},{value:'"square"'}]}},fallback:{defaultValue:null,description:"Ícone fallback",name:"fallback",required:!1,type:{name:"ReactNode"}}}}}catch{}try{v.displayName="AvatarGroup",v.__docgenInfo={description:"",displayName:"AvatarGroup",props:{max:{defaultValue:null,description:"Máximo de avatars visíveis",name:"max",required:!1,type:{name:"number"}}}}}catch{}const N={title:"Components/Avatar",component:e,tags:["autodocs"],argTypes:{size:{control:"select",options:["xs","sm","md","lg","xl"]},shape:{control:"select",options:["circle","square"]}}},n={args:{src:"https://i.pravatar.cc/150?u=alice",alt:"Alice",size:"lg"}},l={args:{name:"Alice Silva",size:"lg"}},o={args:{fallback:a.jsx(f,{size:20}),size:"lg"}},p={args:{name:"Bob",shape:"square",size:"lg"}},m={render:()=>a.jsx("div",{style:{display:"flex",gap:"0.75rem",alignItems:"center"},children:["xs","sm","md","lg","xl"].map(r=>a.jsx(e,{name:"Alice Silva",size:r},r))})},u={render:()=>a.jsxs(v,{children:[a.jsx(e,{name:"Alice",src:"https://i.pravatar.cc/150?u=1"}),a.jsx(e,{name:"Bob",src:"https://i.pravatar.cc/150?u=2"}),a.jsx(e,{name:"Carol",src:"https://i.pravatar.cc/150?u=3"})]})},d={render:()=>a.jsxs(v,{max:3,children:[a.jsx(e,{name:"Alice",src:"https://i.pravatar.cc/150?u=1"}),a.jsx(e,{name:"Bob",src:"https://i.pravatar.cc/150?u=2"}),a.jsx(e,{name:"Carol",src:"https://i.pravatar.cc/150?u=3"}),a.jsx(e,{name:"David",src:"https://i.pravatar.cc/150?u=4"}),a.jsx(e,{name:"Eva",src:"https://i.pravatar.cc/150?u=5"})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    src: 'https://i.pravatar.cc/150?u=alice',
    alt: 'Alice',
    size: 'lg'
  }
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'Alice Silva',
    size: 'lg'
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    fallback: <User size={20} />,
    size: 'lg'
  }
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'Bob',
    shape: 'square',
    size: 'lg'
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  }}>\r
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => <Avatar key={s} name="Alice Silva" size={s} />)}\r
    </div>
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup>\r
      <Avatar name="Alice" src="https://i.pravatar.cc/150?u=1" />\r
      <Avatar name="Bob" src="https://i.pravatar.cc/150?u=2" />\r
      <Avatar name="Carol" src="https://i.pravatar.cc/150?u=3" />\r
    </AvatarGroup>
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup max={3}>\r
      <Avatar name="Alice" src="https://i.pravatar.cc/150?u=1" />\r
      <Avatar name="Bob" src="https://i.pravatar.cc/150?u=2" />\r
      <Avatar name="Carol" src="https://i.pravatar.cc/150?u=3" />\r
      <Avatar name="David" src="https://i.pravatar.cc/150?u=4" />\r
      <Avatar name="Eva" src="https://i.pravatar.cc/150?u=5" />\r
    </AvatarGroup>
}`,...d.parameters?.docs?.source}}};const G=["WithImage","WithInitials","WithFallback","Square","AllSizes","Group","GroupWithMax"];export{m as AllSizes,u as Group,d as GroupWithMax,p as Square,o as WithFallback,n as WithImage,l as WithInitials,G as __namedExportsOrder,N as default};
