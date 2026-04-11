import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as N}from"./index-BxY4JGwq.js";import{c as C}from"./clsx-B-dksMZM.js";/* empty css             */import{B as g}from"./Button-BNyMHqOH.js";import{c as w}from"./createLucideIcon-DA4OzSxG.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css               */const F=w("MoreVertical",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}]]),r=N.forwardRef(({variant:a="elevated",padding:t="md",interactive:s=!1,header:d,footer:n,className:y,children:j,..._},b)=>e.jsxs("div",{ref:b,className:C("ds-card",`ds-card--${a}`,`ds-card--padding-${t}`,s&&"ds-card--interactive",y),..._,children:[d&&e.jsx("div",{className:"ds-card__header",children:d}),e.jsx("div",{className:"ds-card__body",children:j}),n&&e.jsx("div",{className:"ds-card__footer",children:n})]}));r.displayName="Card";function f({title:a,subtitle:t,action:s,className:d,children:n,...y}){return e.jsxs("div",{className:C("ds-card-header",d),...y,children:[e.jsxs("div",{className:"ds-card-header__content",children:[a&&e.jsx("h3",{className:"ds-card-header__title",children:a}),t&&e.jsx("p",{className:"ds-card-header__subtitle",children:t}),n]}),s&&e.jsx("div",{className:"ds-card-header__action",children:s})]})}function x({className:a,children:t,...s}){return e.jsx("div",{className:C("ds-card-footer",a),...s,children:t})}try{f.displayName="CardHeader",f.__docgenInfo={description:"",displayName:"CardHeader",props:{title:{defaultValue:null,description:"",name:"title",required:!1,type:{name:"string"}},subtitle:{defaultValue:null,description:"",name:"subtitle",required:!1,type:{name:"string"}},action:{defaultValue:null,description:"",name:"action",required:!1,type:{name:"ReactNode"}}}}}catch{}try{x.displayName="CardFooter",x.__docgenInfo={description:"",displayName:"CardFooter",props:{}}}catch{}try{r.displayName="Card",r.__docgenInfo={description:"",displayName:"Card",props:{variant:{defaultValue:{value:"elevated"},description:"Variante visual",name:"variant",required:!1,type:{name:"enum",value:[{value:'"elevated"'},{value:'"outlined"'},{value:'"filled"'}]}},padding:{defaultValue:{value:"md"},description:"Padding interno",name:"padding",required:!1,type:{name:"enum",value:[{value:'"none"'},{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},interactive:{defaultValue:{value:"false"},description:"Interativo (hover effect)",name:"interactive",required:!1,type:{name:"boolean"}},header:{defaultValue:null,description:"Header do card",name:"header",required:!1,type:{name:"ReactNode"}},footer:{defaultValue:null,description:"Footer do card",name:"footer",required:!1,type:{name:"ReactNode"}}}}}catch{}const I={title:"Components/Card",component:r,tags:["autodocs"],argTypes:{variant:{control:"select",options:["elevated","outlined","filled"]},padding:{control:"select",options:["none","sm","md","lg"]}}},o={args:{children:"This is a card with some content."}},i={args:{variant:"elevated",children:"Elevated card with shadow."}},c={args:{variant:"outlined",children:"Outlined card with border."}},l={args:{variant:"filled",children:"Filled card with background."}},p={args:{interactive:!0,children:"Click me! I have hover effects."}},u={render:()=>e.jsx(r,{header:e.jsx(f,{title:"Card Title",subtitle:"This is a subtitle",action:e.jsx("button",{style:{background:"none",border:"none",cursor:"pointer"},children:e.jsx(F,{size:16})})}),children:e.jsx("p",{children:"Card body content goes here."})})},m={render:()=>e.jsx(r,{footer:e.jsxs(x,{children:[e.jsx(g,{variant:"ghost",size:"sm",children:"Cancel"}),e.jsx(g,{size:"sm",children:"Save"})]}),children:e.jsx("p",{children:"Card with footer actions."})})},h={render:()=>e.jsx(r,{header:e.jsx(f,{title:"User Profile",subtitle:"Manage your account settings"}),footer:e.jsxs(x,{children:[e.jsx(g,{variant:"ghost",size:"sm",children:"Cancel"}),e.jsx(g,{size:"sm",children:"Save Changes"})]}),children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx("p",{children:"This is a complete card with header, body, and footer."}),e.jsx("p",{children:"You can add any content here."})]})})},v={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"1rem"},children:[e.jsxs(r,{variant:"elevated",children:[e.jsx("strong",{children:"Elevated"}),e.jsx("p",{children:"With shadow"})]}),e.jsxs(r,{variant:"outlined",children:[e.jsx("strong",{children:"Outlined"}),e.jsx("p",{children:"With border"})]}),e.jsxs(r,{variant:"filled",children:[e.jsx("strong",{children:"Filled"}),e.jsx("p",{children:"With background"})]})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'This is a card with some content.'
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'elevated',
    children: 'Elevated card with shadow.'
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'outlined',
    children: 'Outlined card with border.'
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'filled',
    children: 'Filled card with background.'
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    interactive: true,
    children: 'Click me! I have hover effects.'
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Card header={<CardHeader title="Card Title" subtitle="This is a subtitle" action={<button style={{
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  }}><MoreVertical size={16} /></button>} />}>\r
      <p>Card body content goes here.</p>\r
    </Card>
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Card footer={<CardFooter>\r
          <Button variant="ghost" size="sm">Cancel</Button>\r
          <Button size="sm">Save</Button>\r
        </CardFooter>}>\r
      <p>Card with footer actions.</p>\r
    </Card>
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Card header={<CardHeader title="User Profile" subtitle="Manage your account settings" />} footer={<CardFooter>\r
          <Button variant="ghost" size="sm">Cancel</Button>\r
          <Button size="sm">Save Changes</Button>\r
        </CardFooter>}>\r
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>\r
        <p>This is a complete card with header, body, and footer.</p>\r
        <p>You can add any content here.</p>\r
      </div>\r
    </Card>
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem'
  }}>\r
      <Card variant="elevated">\r
        <strong>Elevated</strong>\r
        <p>With shadow</p>\r
      </Card>\r
      <Card variant="outlined">\r
        <strong>Outlined</strong>\r
        <p>With border</p>\r
      </Card>\r
      <Card variant="filled">\r
        <strong>Filled</strong>\r
        <p>With background</p>\r
      </Card>\r
    </div>
}`,...v.parameters?.docs?.source}}};const q=["Default","Elevated","Outlined","Filled","Interactive","WithHeader","WithFooter","Complete","AllVariants"];export{v as AllVariants,h as Complete,o as Default,i as Elevated,l as Filled,p as Interactive,c as Outlined,m as WithFooter,u as WithHeader,q as __namedExportsOrder,I as default};
