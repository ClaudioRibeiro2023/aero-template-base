import{j as e}from"./jsx-runtime-CSjhXfFz.js";import{r as i}from"./index-BxY4JGwq.js";import{c as O}from"./clsx-B-dksMZM.js";import{M as D}from"./Modal-CNp-XRAE.js";import{B as o}from"./Button-BNyMHqOH.js";import{I as b}from"./info-hi-Wa6va.js";import{A as T}from"./alert-triangle-C2XFMsst.js";import{T as j}from"./trash-2-DwMhtAJX.js";import"./_commonjsHelpers-CqkleIqs.js";/* empty css              */import"./x-lWMTmhcP.js";import"./createLucideIcon-DA4OzSxG.js";/* empty css               */const y={danger:e.jsx(j,{size:20}),warning:e.jsx(T,{size:20}),info:e.jsx(b,{size:20})};function r({isOpen:a,onClose:t,onConfirm:n,title:p,description:s,confirmText:f="Confirmar",cancelText:v="Cancelar",variant:g="danger",isLoading:l=!1,icon:x,children:h}){const C=x??y[g];return e.jsxs(D,{isOpen:a,onClose:t,title:p,description:s,size:"sm",closeOnOverlayClick:!l,closeOnEsc:!l,footer:e.jsxs("div",{className:"ds-confirm-dialog__actions",children:[e.jsx(o,{variant:"ghost",onClick:t,disabled:l,children:v}),e.jsx(o,{variant:g==="danger"?"danger":"primary",onClick:n,isLoading:l,children:f})]}),children:[C&&e.jsx("div",{className:O("ds-confirm-dialog__icon",`ds-confirm-dialog__icon--${g}`),children:C}),h]})}try{r.displayName="ConfirmDialog",r.__docgenInfo={description:"",displayName:"ConfirmDialog",props:{isOpen:{defaultValue:null,description:"Visibilidade",name:"isOpen",required:!0,type:{name:"boolean"}},onClose:{defaultValue:null,description:"Callback ao fechar",name:"onClose",required:!0,type:{name:"() => void"}},onConfirm:{defaultValue:null,description:"Callback ao confirmar",name:"onConfirm",required:!0,type:{name:"() => void"}},title:{defaultValue:null,description:"Título",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"Mensagem/descrição",name:"description",required:!1,type:{name:"string"}},confirmText:{defaultValue:{value:"Confirmar"},description:"Texto do botão confirmar",name:"confirmText",required:!1,type:{name:"string"}},cancelText:{defaultValue:{value:"Cancelar"},description:"Texto do botão cancelar",name:"cancelText",required:!1,type:{name:"string"}},variant:{defaultValue:{value:"danger"},description:"Variante visual",name:"variant",required:!1,type:{name:"enum",value:[{value:'"danger"'},{value:'"warning"'},{value:'"info"'}]}},isLoading:{defaultValue:{value:"false"},description:"Loading no botão confirmar",name:"isLoading",required:!1,type:{name:"boolean"}},icon:{defaultValue:null,description:"Ícone customizado",name:"icon",required:!1,type:{name:"ReactNode"}}}}}catch{}const N={title:"Components/ConfirmDialog",component:r,tags:["autodocs"],argTypes:{variant:{control:"select",options:["danger","warning","info"]}}},c={render:function(){const[t,n]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{variant:"danger",onClick:()=>n(!0),children:"Delete Item"}),e.jsx(r,{isOpen:t,onClose:()=>n(!1),onConfirm:()=>{n(!1),alert("Deleted!")},title:"Delete this item?",description:"This action cannot be undone. All associated data will be permanently removed.",confirmText:"Delete",cancelText:"Cancel",variant:"danger"})]})}},d={render:function(){const[t,n]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{variant:"outline",onClick:()=>n(!0),children:"Reset Settings"}),e.jsx(r,{isOpen:t,onClose:()=>n(!1),onConfirm:()=>n(!1),title:"Reset all settings?",description:"Your preferences will revert to their default values.",confirmText:"Reset",variant:"warning"})]})}},u={render:function(){const[t,n]=i.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(o,{onClick:()=>n(!0),children:"Publish"}),e.jsx(r,{isOpen:t,onClose:()=>n(!1),onConfirm:()=>n(!1),title:"Publish this article?",description:"It will become visible to all users.",confirmText:"Publish",variant:"info"})]})}},m={render:function(){const[t,n]=i.useState(!1),[p,s]=i.useState(!1),f=()=>{s(!0),setTimeout(()=>{s(!1),n(!1)},2e3)};return e.jsxs(e.Fragment,{children:[e.jsx(o,{variant:"danger",onClick:()=>n(!0),children:"Delete"}),e.jsx(r,{isOpen:t,onClose:()=>n(!1),onConfirm:f,title:"Delete permanently?",description:"Processing...",isLoading:p,variant:"danger"})]})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button variant="danger" onClick={() => setOpen(true)}>\r
          Delete Item\r
        </Button>\r
        <ConfirmDialog isOpen={open} onClose={() => setOpen(false)} onConfirm={() => {
        setOpen(false);
        alert('Deleted!');
      }} title="Delete this item?" description="This action cannot be undone. All associated data will be permanently removed." confirmText="Delete" cancelText="Cancel" variant="danger" />\r
      </>;
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button variant="outline" onClick={() => setOpen(true)}>\r
          Reset Settings\r
        </Button>\r
        <ConfirmDialog isOpen={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} title="Reset all settings?" description="Your preferences will revert to their default values." confirmText="Reset" variant="warning" />\r
      </>;
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Publish</Button>\r
        <ConfirmDialog isOpen={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} title="Publish this article?" description="It will become visible to all users." confirmText="Publish" variant="info" />\r
      </>;
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: function Demo() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);
    };
    return <>\r
        <Button variant="danger" onClick={() => setOpen(true)}>\r
          Delete\r
        </Button>\r
        <ConfirmDialog isOpen={open} onClose={() => setOpen(false)} onConfirm={handleConfirm} title="Delete permanently?" description="Processing..." isLoading={loading} variant="danger" />\r
      </>;
  }
}`,...m.parameters?.docs?.source}}};const A=["Danger","Warning","Info","WithLoading"];export{c as Danger,u as Info,d as Warning,m as WithLoading,A as __namedExportsOrder,N as default};
