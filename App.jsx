import { useState, useEffect, useRef, createContext, useContext } from "react"
import { supabase } from "./supabase.js"

/* ── TOKENS ── */
const C = {
  bg:"#0F1117", surface:"#161920", card:"#1C1F2A", border:"#252836",
  borderLight:"#2E3245", ink:"#E8E4DE", inkMid:"#9B96A0", inkSoft:"#5A5668",
  teal:"#5BA8A0", tealSoft:"rgba(91,168,160,0.12)", tealMid:"rgba(91,168,160,0.25)",
  rose:"#C9837A", roseSoft:"rgba(201,131,122,0.12)",
  sage:"#7A9E8E", sageSoft:"rgba(122,158,142,0.12)",
  gold:"#D4A853", goldSoft:"rgba(212,168,83,0.12)",
  warn:"#D97B4F", warnSoft:"rgba(217,123,79,0.12)",
  error:"#E05252", errorSoft:"rgba(224,82,82,0.12)",
  green:"#5A9E6F", greenSoft:"rgba(90,158,111,0.12)",
}
const F = { d:"'Cormorant Garant',serif", u:"'Outfit',sans-serif" }

/* ── AUTH CONTEXT ── */
const AuthCtx = createContext(null)
const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [user,   setUser]   = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [ready,  setReady]  = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchDoctor(session.user.id)
      else setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchDoctor(session.user.id)
      else { setDoctor(null); setReady(true) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchDoctor = async (uid) => {
    const { data } = await supabase.from("doctors").select("*").eq("id", uid).single()
    setDoctor(data)
    setReady(true)
  }

  const refreshDoctor = async () => {
    if (!user) return
    const { data } = await supabase.from("doctors").select("*").eq("id", user.id).single()
    setDoctor(data)
  }

  const signOut = async () => { await supabase.auth.signOut() }

  return (
    <AuthCtx.Provider value={{ user, doctor, ready, refreshDoctor, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

/* ── ICONS ── */
const Moon     = ({s=20,c=C.teal})    => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Back     = ({s=18,c=C.inkSoft}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Check    = ({s=16,c=C.green})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.5"/><path d="M8 12l3 3 5-5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Clock    = ({s=14,c=C.gold})    => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>
const Mail     = ({s=16,c=C.teal})    => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={c} strokeWidth="1.5"/><polyline points="22,6 12,13 2,6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>
const User     = ({s=16,c=C.inkMid}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M20 21c0-4-3.6-7-8-7s-8 3-8 7M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Star     = ({s=14,c=C.gold})    => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} style={{flexShrink:0}}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
const Stethoscope = ({s=16,c=C.teal}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="10" r="2" stroke={c} strokeWidth="1.5"/></svg>
const Shield   = ({s=14,c=C.sage})   => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>
const Logout   = ({s=16,c=C.error})  => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Chat     = ({s=16,c=C.inkMid}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Bell     = ({s=16,c=C.inkMid}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

/* ── SHARED UI ── */
const Spinner = ({size=20,c=C.teal}) => (
  <div className="spin" style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${c}30`,borderTopColor:c,flexShrink:0}}/>
)

const ErrMsg = ({msg}) => msg ? (
  <div style={{background:C.errorSoft,border:`1px solid ${C.error}30`,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"flex-start"}}>
    <span style={{fontSize:13,flexShrink:0}}>⚠️</span>
    <span style={{fontFamily:F.u,fontSize:12,color:C.error,lineHeight:1.5}}>{msg}</span>
  </div>
) : null

const OkMsg = ({msg}) => msg ? (
  <div style={{background:C.greenSoft,border:`1px solid ${C.green}30`,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"center"}}>
    <span style={{fontSize:13}}>✅</span>
    <span style={{fontFamily:F.u,fontSize:12,color:C.green,lineHeight:1.4}}>{msg}</span>
  </div>
) : null

const Btn = ({label,onClick,disabled=false,loading=false,bg=C.teal,color="#0F1117",full=true}) => (
  <button onClick={onClick} disabled={disabled||loading}
    style={{width:full?"100%":"auto",padding:"14px 24px",borderRadius:12,background:disabled||loading?"#252836":bg,color:disabled||loading?C.inkSoft:color,fontFamily:F.u,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s",cursor:disabled||loading?"not-allowed":"pointer"}}>
    {loading && <Spinner size={16} c={color}/>}
    {label}
  </button>
)

const GhostBtn = ({label,onClick,color=C.inkMid}) => (
  <button onClick={onClick} style={{width:"100%",padding:"13px",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color,fontFamily:F.u,fontWeight:500,fontSize:13,transition:"all .2s"}}>{label}</button>
)

const Input = ({label,placeholder,value,onChange,type="text",icon,required=false}) => (
  <div style={{marginBottom:18}}>
    <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{label}{required&&<span style={{color:C.rose,marginLeft:3}}>*</span>}</label>
    <div style={{display:"flex",alignItems:"center",gap:10,background:C.card,border:`1px solid ${value?C.tealMid:C.border}`,borderRadius:12,padding:"13px 16px",transition:"border-color .2s"}}>
      {icon && <span style={{flexShrink:0}}>{icon}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{flex:1,fontFamily:F.u,fontSize:14,color:C.ink,background:"transparent"}}
        required={required}/>
    </div>
  </div>
)

const StatusBadge = ({status}) => {
  const map = {
    pending:   {label:"Pending Review", color:C.gold,   bg:C.goldSoft},
    verified:  {label:"Verified",       color:C.green,  bg:C.greenSoft},
    suspended: {label:"Suspended",      color:C.error,  bg:C.errorSoft},
  }
  const s = map[status] || map.pending
  return <span style={{fontFamily:F.u,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:s.color,background:s.bg,padding:"4px 10px",borderRadius:99}}>{s.label}</span>
}

const Loader = ({msg="Loading…"}) => (
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:32,minHeight:"100vh"}}>
    <div style={{width:64,height:64,borderRadius:"50%",background:C.tealSoft,border:`1px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Moon s={28}/>
    </div>
    <Spinner size={32}/>
    <span style={{fontFamily:F.u,fontSize:13,color:C.inkSoft}}>{msg}</span>
  </div>
)

/* ════════ WELCOME ════════ */
function Welcome({onRegister, onLogin}) {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:`radial-gradient(ellipse at 20% 50%, ${C.tealSoft} 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(122,158,142,0.08) 0%, transparent 50%), ${C.bg}`}}>
      <div className="fu" style={{maxWidth:480,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:C.tealSoft,border:`1px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
            <Moon s={36}/>
          </div>
          <div style={{fontFamily:F.d,fontSize:42,fontWeight:600,color:C.ink,lineHeight:1.1,marginBottom:8}}>Luna Care</div>
          <div style={{fontFamily:F.u,fontSize:12,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",color:C.teal,marginBottom:16}}>Professional Portal</div>
          <p style={{fontFamily:F.u,fontSize:14,color:C.inkMid,lineHeight:1.7,maxWidth:360,margin:"0 auto"}}>
            Join Nigeria's most trusted anonymous reproductive health platform. Help patients privately and professionally.
          </p>
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"32px",marginBottom:16}}>
          {[
            {icon:<Shield s={14} c={C.teal}/>, text:"Patient identities stay completely anonymous"},
            {icon:<Check s={14} c={C.green}/>, text:"MDCN-verified professionals only"},
            {icon:<Star s={14} c={C.gold}/>, text:"Earn per question answered — from ₦2,000"},
          ].map((item,i) => (
            <div key={i} className={`fu d${i+1}`} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<2?16:0}}>
              <div style={{width:32,height:32,borderRadius:9,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.icon}</div>
              <span style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.4}}>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="fu d4" style={{display:"flex",flexDirection:"column",gap:12}}>
          <Btn label="Apply as a professional →" onClick={onRegister} bg={C.teal}/>
          <GhostBtn label="Sign in to my account" onClick={onLogin}/>
        </div>

        <p style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,textAlign:"center",marginTop:24,lineHeight:1.6}}>
          All applications are reviewed by the Luna Care team. MDCN number required.
        </p>
      </div>
    </div>
  )
}

/* ════════ REGISTER ════════ */
function Register({onBack, onSent}) {
  const [form, setForm] = useState({fullName:"",email:"",phone:"",specialty:"",mdcn:"",experience:"",bio:""})
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const specialties = ["Obstetrics & Gynaecology","Reproductive Endocrinology","General Practice","Family Medicine","Paediatrics","Urology","Endocrinology","Internal Medicine","Psychiatry","Other"]
  const valid = form.fullName.trim().length>2 && form.email.includes("@") && form.specialty && form.mdcn.trim().length>4

  const submit = async () => {
    setLoading(true); setErr("")
    // Send OTP first
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: form.email.trim().toLowerCase(),
      options: { shouldCreateUser: true }
    })
    if (otpErr) { setErr(otpErr.message); setLoading(false); return }
    onSent(form)
    setLoading(false)
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,overflowY:"auto"}}>
      <div style={{maxWidth:560,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <button onClick={onBack} style={{width:38,height:38,borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Back s={16}/></button>
          <div>
            <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.teal,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Step 1 of 2</div>
            <div style={{fontFamily:F.d,fontSize:24,color:C.ink,fontWeight:600}}>Professional Application</div>
          </div>
        </div>

        <ErrMsg msg={err}/>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px",marginBottom:20}}>
          <div style={{fontFamily:F.u,fontSize:11,fontWeight:700,color:C.teal,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:20}}>Personal Information</div>
          <Input label="Full name" placeholder="Dr. Amara Okafor" value={form.fullName} onChange={e=>set("fullName",e.target.value)} icon={<User s={15}/>} required/>
          <Input label="Email address" placeholder="doctor@hospital.com" value={form.email} onChange={e=>set("email",e.target.value)} type="email" icon={<Mail s={15}/>} required/>
          <Input label="Phone number" placeholder="+234 801 234 5678" value={form.phone} onChange={e=>set("phone",e.target.value)} icon={<span style={{fontSize:13}}>📱</span>}/>
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px",marginBottom:20}}>
          <div style={{fontFamily:F.u,fontSize:11,fontWeight:700,color:C.teal,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:20}}>Professional Details</div>

          <div style={{marginBottom:18}}>
            <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Specialty <span style={{color:C.rose}}>*</span></label>
            <div style={{position:"relative"}}>
              <select value={form.specialty} onChange={e=>set("specialty",e.target.value)}
                style={{width:"100%",background:C.card,border:`1px solid ${form.specialty?C.tealMid:C.border}`,borderRadius:12,padding:"13px 16px",fontFamily:F.u,fontSize:14,color:form.specialty?C.ink:C.inkSoft,appearance:"none",cursor:"pointer"}}>
                <option value="">Select your specialty</option>
                {specialties.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:C.inkSoft,pointerEvents:"none"}}>▾</span>
            </div>
          </div>

          <Input label="MDCN Registration Number" placeholder="e.g. MD/2018/12345" value={form.mdcn} onChange={e=>set("mdcn",e.target.value)} icon={<Shield s={14} c={C.teal}/>} required/>
          <Input label="Years of Experience" placeholder="e.g. 8" value={form.experience} onChange={e=>set("experience",e.target.value)} type="number" icon={<span style={{fontSize:13}}>🏥</span>}/>

          <div style={{marginBottom:0}}>
            <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Short Bio</label>
            <div style={{background:C.card,border:`1px solid ${form.bio?C.tealMid:C.border}`,borderRadius:12,padding:"13px 16px",transition:"border-color .2s"}}>
              <textarea rows={3} placeholder="Brief professional background and areas of expertise…" value={form.bio} onChange={e=>set("bio",e.target.value.slice(0,300))}
                style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.6}}/>
              <div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft,textAlign:"right",marginTop:4}}>{form.bio.length}/300</div>
            </div>
          </div>
        </div>

        <div style={{background:C.goldSoft,border:`1px solid ${C.gold}30`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
          <Clock s={15}/>
          <span style={{fontFamily:F.u,fontSize:12,color:C.inkMid,lineHeight:1.5}}>Applications are reviewed within <strong style={{color:C.gold}}>24–48 hours</strong>. You'll receive a verification email once approved.</span>
        </div>

        <Btn label={loading?"Sending verification code…":"Continue →"} onClick={submit} disabled={!valid} loading={loading}/>
      </div>
    </div>
  )
}

/* ════════ LOGIN ════════ */
function Login({onBack, onSent}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const send = async () => {
    setLoading(true); setErr("")
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false }
    })
    if (error) { setErr(error.message); setLoading(false); return }
    onSent({ email: email.trim().toLowerCase() })
    setLoading(false)
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:C.bg}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:40}}>
          <button onClick={onBack} style={{width:38,height:38,borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Back s={16}/></button>
          <div style={{fontFamily:F.d,fontSize:26,color:C.ink,fontWeight:600}}>Welcome back</div>
        </div>

        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:C.tealSoft,border:`1px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Moon s={30}/></div>
          <p style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.6}}>Enter your registered email to receive a secure sign-in code.</p>
        </div>

        <ErrMsg msg={err}/>
        <Input label="Email address" placeholder="doctor@hospital.com" value={email} onChange={e=>setEmail(e.target.value)} type="email" icon={<Mail s={15}/>}/>
        <Btn label="Send sign-in code →" onClick={send} disabled={!email.includes("@")} loading={loading}/>
      </div>
    </div>
  )
}

/* ════════ OTP ════════ */
function OTP({formData, onBack, onDone}) {
  const [otp, setOtp] = useState(["","","","","",""])
  const [seconds, setSeconds] = useState(59)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [ok, setOk] = useState("")
  const refs = useRef([])
  const isRegister = !!formData?.fullName

  useEffect(()=>{
    refs.current[0]?.focus()
    if(seconds<=0)return
    const t=setTimeout(()=>setSeconds(s=>s-1),1000)
    return()=>clearTimeout(t)
  },[seconds])

  const key=(i,val)=>{
    if(!/^\d?$/.test(val))return
    const n=[...otp];n[i]=val;setOtp(n)
    if(val&&i<5)refs.current[i+1]?.focus()
    if(!val&&i>0)refs.current[i-1]?.focus()
  }

  const verify = async () => {
    const token = otp.join("")
    if(token.length<6)return
    setLoading(true); setErr("")
    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email, token, type: "email"
    })
    if (error) {
      setErr("Incorrect code — please try again.")
      setLoading(false)
      setOtp(["","","","","",""])
      setTimeout(()=>refs.current[0]?.focus(),50)
      return
    }
    // If registering, create doctor record
    if (isRegister) {
      const { error: docErr } = await supabase.from("doctors").upsert({
        id: data.user.id,
        full_name: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone || null,
        specialty: formData.specialty,
        mdcn_number: formData.mdcn,
        years_experience: parseInt(formData.experience)||0,
        bio: formData.bio || null,
        status: "pending",
      }, { onConflict: "id" })
      if (docErr) { setErr(docErr.message); setLoading(false); return }
    }
    setOk("✓ Verified successfully!")
    setTimeout(()=>onDone(),900)
  }

  const filled = otp.every(d=>d!=="")

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:C.bg}}>
      <div style={{maxWidth:400,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:40}}>
          <button onClick={onBack} style={{width:38,height:38,borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Back s={16}/></button>
          <div>
            <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.teal,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{isRegister?"Step 2 of 2":"Sign in"}</div>
            <div style={{fontFamily:F.d,fontSize:24,color:C.ink,fontWeight:600}}>Verify your email</div>
          </div>
        </div>

        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:C.tealSoft,border:`1px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Mail s={28}/></div>
          <p style={{fontFamily:F.u,fontSize:13,color:C.inkMid,marginBottom:6}}>6-digit code sent to</p>
          <p style={{fontFamily:F.u,fontSize:15,fontWeight:600,color:C.ink}}>{formData?.email}</p>
        </div>

        <ErrMsg msg={err}/><OkMsg msg={ok}/>

        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:12}}>
          {otp.map((d,i)=>(
            <input key={i} ref={el=>refs.current[i]=el} maxLength={1} value={d}
              onChange={e=>key(i,e.target.value)}
              onKeyDown={e=>{if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus();if(e.key==="Enter"&&filled)verify()}}
              style={{width:48,height:58,borderRadius:12,textAlign:"center",fontFamily:F.d,fontSize:26,fontWeight:600,color:C.ink,background:d?C.tealSoft:C.card,border:`1px solid ${d?C.tealMid:C.border}`,transition:"all .15s"}}/>
          ))}
        </div>

        <p style={{fontFamily:F.u,fontSize:11,color:C.inkSoft,textAlign:"center",marginBottom:8}}>Check your spam folder if not received.</p>
        <p style={{fontFamily:F.u,fontSize:12,color:C.inkSoft,textAlign:"center",marginBottom:24}}>
          {seconds>0?<>Resend in <span style={{color:C.teal,fontWeight:600}}>0:{String(seconds).padStart(2,"0")}</span></>:
          <button style={{color:C.teal,fontWeight:600,fontSize:12,fontFamily:F.u}} onClick={async()=>{setSeconds(59);await supabase.auth.signInWithOtp({email:formData.email,options:{shouldCreateUser:false}})}}>Resend code</button>}
        </p>

        <Btn label={loading?"Verifying…":"Verify & continue →"} onClick={verify} disabled={!filled} loading={loading}/>
        <div style={{height:12}}/><GhostBtn label="← Change email" onClick={onBack} color={C.inkSoft}/>
      </div>
    </div>
  )
}

/* ════════ PENDING ════════ */
function Pending({onSignOut}) {
  const {doctor} = useAuth()
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:C.bg}}>
      <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:C.goldSoft,border:`1px solid ${C.gold}40`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
          <Clock s={36} c={C.gold}/>
        </div>
        <div style={{fontFamily:F.d,fontSize:32,color:C.ink,fontWeight:600,marginBottom:12}}>Application Under Review</div>
        <p style={{fontFamily:F.u,fontSize:14,color:C.inkMid,lineHeight:1.7,marginBottom:32}}>
          Thank you, <strong style={{color:C.ink}}>{doctor?.full_name?.split(" ")[0] || "Doctor"}</strong>! Your application is being reviewed by our team. You'll receive an email at <strong style={{color:C.teal}}>{doctor?.email}</strong> once verified.
        </p>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px",marginBottom:24,textAlign:"left"}}>
          <div style={{fontFamily:F.u,fontSize:11,fontWeight:700,color:C.teal,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>Your Application</div>
          {[
            {label:"Name",     val:doctor?.full_name||"—"},
            {label:"Specialty",val:doctor?.specialty||"—"},
            {label:"MDCN No.", val:doctor?.mdcn_number||"—"},
            {label:"Status",   val:<StatusBadge status={doctor?.status||"pending"}/>},
          ].map(row=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>{row.label}</span>
              <span style={{fontFamily:F.u,fontSize:12,color:C.ink,fontWeight:500}}>{row.val}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>Review time</span>
            <span style={{fontFamily:F.u,fontSize:12,color:C.gold,fontWeight:500}}>24–48 hours</span>
          </div>
        </div>
        <button onClick={onSignOut} style={{display:"flex",alignItems:"center",gap:8,margin:"0 auto",fontFamily:F.u,fontSize:13,color:C.inkSoft}}>
          <Logout s={14} c={C.inkSoft}/> Sign out
        </button>
      </div>
    </div>
  )
}

/* ════════ DASHBOARD ════════ */
function Dashboard() {
  const {doctor, signOut, refreshDoctor} = useAuth()
  const [tab, setTab] = useState("questions")
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQ, setSelectedQ] = useState(null)
  const [response, setResponse] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [threadReply, setThreadReply] = useState("")
  const [ok, setOk] = useState("")
  const [isOnline, setIsOnline] = useState(doctor?.is_online||false)

  useEffect(()=>{ loadQuestions() },[tab])

  // Realtime — update selected question when patient sends follow-up
  useEffect(()=>{
    if(!selectedQ)return
    const channel = supabase.channel(`portal-q-${selectedQ.id}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"questions",filter:`id=eq.${selectedQ.id}`},
        (payload)=>{ setSelectedQ(prev=>({...prev,...payload.new})); loadQuestions() }
      ).subscribe()
    return()=>supabase.removeChannel(channel)
  },[selectedQ?.id])

  const loadQuestions = async () => {
    setLoading(true)
    let q = supabase.from("questions").select("*").order("created_at",{ascending:false})
    if(tab==="pending")   q = q.eq("status","pending")
    if(tab==="answered")  q = q.eq("assigned_doctor_id",doctor?.id)
    if(tab==="urgent")    q = q.eq("is_urgent",true).eq("status","pending")
    const {data} = await q.limit(50)
    setQuestions(data||[])
    setLoading(false)
  }

  const submitResponse = async () => {
    if(!response.trim()||!selectedQ)return
    setSubmitting(true)
    await supabase.from("questions").update({
      professional_response: response.trim(),
      status: "professional_answered",
      assigned_doctor_id: doctor?.id,
      answered_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    }).eq("id",selectedQ.id)
    await supabase.from("doctors").update({
      total_answered: (doctor?.total_answered||0)+1,
      total_earnings: (doctor?.total_earnings||0)+2000,
    }).eq("id",doctor?.id)
    await refreshDoctor()
    setOk("Response submitted!")
    setSelectedQ(null)
    setResponse("")
    setTimeout(()=>setOk(""),3000)
    loadQuestions()
    setSubmitting(false)
  }

  const submitThreadReply = async () => {
    if(!threadReply.trim()||!selectedQ)return
    setSubmitting(true)
    const messages = Array.isArray(selectedQ.thread_messages) ? selectedQ.thread_messages : []
    const newMsg = { role:"doctor", content:threadReply.trim(), created_at:new Date().toISOString() }
    const updated = [...messages, newMsg]
    await supabase.from("questions").update({
      thread_messages: updated,
      last_activity_at: new Date().toISOString(),
      thread_closed_at: null,
    }).eq("id",selectedQ.id)
    setSelectedQ(prev=>({...prev, thread_messages:updated, last_activity_at:new Date().toISOString(), thread_closed_at:null}))
    setThreadReply("")
    setOk("Reply sent!")
    setTimeout(()=>setOk(""),3000)
    setSubmitting(false)
  }

  const toggleOnline = async () => {
    const newVal = !isOnline
    setIsOnline(newVal)
    await supabase.from("doctors").update({is_online:newVal}).eq("id",doctor?.id)
  }

  const topicColor = {
    Menstrual:C.rose, Pregnancy:C.sage, Contraception:C.gold,
    Reproductive:C.rose, "STIs & STDs":C.warn, Fertility:C.teal
  }

  const tabs = [
    {id:"questions", label:"All Questions"},
    {id:"pending",   label:"Pending"},
    {id:"urgent",    label:"🚨 Urgent"},
    {id:"answered",  label:"My Answered"},
  ]

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Moon s={22}/>
          <div>
            <div style={{fontFamily:F.d,fontSize:18,color:C.ink,fontWeight:600,lineHeight:1}}>Luna Care</div>
            <div style={{fontFamily:F.u,fontSize:9,color:C.teal,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>Professional Portal</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {/* Online toggle */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:F.u,fontSize:11,color:C.inkMid}}>{isOnline?"Online":"Offline"}</span>
            <div onClick={toggleOnline} style={{width:42,height:24,borderRadius:99,background:isOnline?C.green:"#252836",position:"relative",transition:"background .2s",cursor:"pointer"}}>
              <div style={{position:"absolute",top:2,left:isOnline?20:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:C.tealSoft,border:`1px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.d,fontSize:15,fontWeight:600,color:C.teal}}>
              {doctor?.full_name?.[0]?.toUpperCase()||"D"}
            </div>
            <div>
              <div style={{fontFamily:F.u,fontSize:12,color:C.ink,fontWeight:500}}>{doctor?.full_name?.split(" ").slice(0,2).join(" ")||"Doctor"}</div>
              <div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft}}>{doctor?.specialty||""}</div>
            </div>
          </div>
          <button onClick={signOut} style={{width:34,height:34,borderRadius:9,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Logout s={14}/>
          </button>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* Sidebar */}
        <div style={{width:240,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,padding:"20px 0"}}>
          {/* Stats */}
          <div style={{padding:"0 16px 20px",borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
            {[
              {label:"Questions Answered", val:doctor?.total_answered||0, color:C.teal},
              {label:"Total Earned", val:`₦${((doctor?.total_earnings||0)).toLocaleString()}`, color:C.gold},
              {label:"Rating", val:`${doctor?.rating||"4.9"} ★`, color:C.sage},
            ].map(s=>(
              <div key={s.label} style={{marginBottom:12}}>
                <div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft,marginBottom:2}}>{s.label}</div>
                <div style={{fontFamily:F.d,fontSize:22,color:s.color,fontWeight:600,lineHeight:1}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Nav */}
          {[
            {id:"questions",label:"Questions",   icon:<Chat s={14}/>},
            {id:"profile",  label:"My Profile",  icon:<User s={14}/>},
          ].map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",margin:"2px 8px",borderRadius:10,background:tab===item.id?C.tealSoft:"transparent",color:tab===item.id?C.teal:C.inkMid,fontFamily:F.u,fontSize:13,fontWeight:tab===item.id?600:400,transition:"all .15s"}}>
              {item.icon}{item.label}
            </button>
          ))}

          <div style={{marginTop:"auto",padding:"16px"}}>
            <StatusBadge status={doctor?.status||"pending"}/>
          </div>
        </div>

        {/* Main content */}
        <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
          {tab==="profile" ? (
            <ProfileTab/>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{fontFamily:F.d,fontSize:28,color:C.ink,fontWeight:600}}>Patient Questions</div>
                <OkMsg msg={ok}/>
              </div>

              {/* Sub tabs */}
              <div style={{display:"flex",gap:4,marginBottom:20,background:C.card,borderRadius:12,padding:4}}>
                {tabs.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    style={{flex:1,padding:"8px 12px",borderRadius:9,fontFamily:F.u,fontSize:12,fontWeight:600,background:tab===t.id?C.surface:"transparent",color:tab===t.id?C.ink:C.inkSoft,transition:"all .15s"}}>
                    {t.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {[1,2,3].map(i=><div key={i} style={{height:100,borderRadius:14,background:C.card,opacity:0.5}}/>)}
                </div>
              ) : questions.length===0 ? (
                <div style={{textAlign:"center",padding:"60px 20px"}}>
                  <div style={{fontSize:40,marginBottom:16}}>💬</div>
                  <div style={{fontFamily:F.d,fontSize:24,color:C.ink,fontWeight:600,marginBottom:8}}>No questions yet</div>
                  <div style={{fontFamily:F.u,fontSize:13,color:C.inkMid}}>New patient questions will appear here</div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {questions.map(q=>(
                    <div key={q.id} onClick={()=>{setSelectedQ(q);setResponse(q.professional_response||"")}}
                      style={{background:C.card,border:`1px solid ${selectedQ?.id===q.id?C.tealMid:C.border}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .2s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontFamily:F.u,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:topicColor[q.topic]||C.teal,background:`${topicColor[q.topic]||C.teal}15`,padding:"4px 10px",borderRadius:99}}>{q.topic}</span>
                          {q.is_urgent && <span style={{fontFamily:F.u,fontSize:10,fontWeight:700,color:C.warn,background:C.warnSoft,padding:"4px 10px",borderRadius:99}}>🚨 Urgent</span>}
                        </div>
                        <span style={{fontFamily:F.u,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",
                          color:q.status==="professional_answered"?C.green:q.status==="ai_answered"?C.teal:C.gold,
                          background:q.status==="professional_answered"?C.greenSoft:q.status==="ai_answered"?C.tealSoft:C.goldSoft,
                          padding:"4px 10px",borderRadius:99}}>
                          {q.status==="professional_answered"?"✓ Answered":q.status==="ai_answered"?"AI Replied":"Pending"}
                        </span>
                      </div>
                      <p style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.5,marginBottom:8}}>{q.content}</p>
                      <span style={{fontFamily:F.u,fontSize:11,color:C.inkSoft}}>{new Date(q.created_at).toLocaleDateString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Response panel */}
        {selectedQ && tab!=="profile" && (
          <div style={{width:400,background:C.surface,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontFamily:F.u,fontSize:12,fontWeight:600,color:C.ink}}>Patient Conversation</div>
              <button onClick={()=>setSelectedQ(null)} style={{color:C.inkSoft,fontSize:20,lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>

              {/* Original question */}
              <div style={{background:C.card,borderRadius:12,padding:"12px",marginBottom:10}}>
                <div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Patient Question</div>
                <p style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.6,margin:0}}>{selectedQ.content}</p>
              </div>

              {/* AI response */}
              {selectedQ.ai_response && (
                <div style={{background:C.tealSoft,border:`1px solid ${C.tealMid}`,borderRadius:12,padding:"12px",marginBottom:10}}>
                  <div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>AI Provisional Response</div>
                  <p style={{fontFamily:F.u,fontSize:12,color:C.inkMid,lineHeight:1.6,margin:0}}>{selectedQ.ai_response}</p>
                </div>
              )}

              {/* Thread messages (follow-ups) */}
              {Array.isArray(selectedQ.thread_messages) && selectedQ.thread_messages.length>0 && (
                <div style={{marginBottom:10}}>
                  <div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,textAlign:"center"}}>— Follow-up conversation —</div>
                  {selectedQ.thread_messages.map((msg,i)=>(
                    <div key={i} style={{marginBottom:8,display:"flex",flexDirection:"column",alignItems:msg.role==="patient"?"flex-end":"flex-start"}}>
                      <div style={{maxWidth:"88%",background:msg.role==="patient"?"#2A3545":msg.role==="ai"?"rgba(91,168,160,0.15)":"rgba(90,158,111,0.15)",borderRadius:msg.role==="patient"?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"10px 12px"}}>
                        {msg.role!=="patient" && (
                          <div style={{fontFamily:F.u,fontSize:9,fontWeight:700,color:msg.role==="ai"?C.teal:C.sage,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>
                            {msg.role==="ai"?"AI":"Doctor"}
                          </div>
                        )}
                        <p style={{fontFamily:F.u,fontSize:12,color:msg.role==="patient"?"#C8D8E8":C.inkMid,lineHeight:1.55,margin:0}}>{msg.content}</p>
                        <div style={{fontFamily:F.u,fontSize:9,color:C.inkSoft,marginTop:4,textAlign:msg.role==="patient"?"right":"left"}}>
                          {new Date(msg.created_at).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Doctor's response input */}
              <div style={{marginBottom:10}}>
                <label style={{display:"block",fontFamily:F.u,fontSize:9,fontWeight:700,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Your Professional Response</label>
                <div style={{background:C.card,border:`1px solid ${response?C.tealMid:C.border}`,borderRadius:12,padding:"12px",transition:"border-color .2s"}}>
                  <textarea rows={6} placeholder="Provide your professional response. Patient identity is anonymous." value={response} onChange={e=>setResponse(e.target.value)}
                    style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.7,background:"transparent"}}
                    disabled={selectedQ.status==="professional_answered"}/>
                </div>
              </div>

              {selectedQ.status==="professional_answered" ? (
                <div style={{background:C.greenSoft,border:`1px solid ${C.green}30`,borderRadius:10,padding:"12px",textAlign:"center",marginBottom:12}}>
                  <span style={{fontFamily:F.u,fontSize:12,color:C.green,fontWeight:600}}>✓ Already answered by you</span>
                </div>
              ) : (
                <Btn label={submitting?"Submitting…":"Submit Response"} onClick={submitResponse} disabled={!response.trim()} loading={submitting} bg={C.teal}/>
              )}

              {/* Thread reply — always available after question has any response */}
              {(selectedQ.status==="professional_answered"||selectedQ.status==="ai_answered") && (
                <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
                  <label style={{display:"block",fontFamily:F.u,fontSize:9,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Reply to follow-up</label>
                  <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                    <div style={{flex:1,background:C.card,border:`1px solid ${threadReply?C.tealMid:C.border}`,borderRadius:12,padding:"10px 12px",transition:"border-color .2s"}}>
                      <textarea rows={3} placeholder="Reply to the patient's follow-up…" value={threadReply} onChange={e=>setThreadReply(e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&threadReply.trim()){e.preventDefault();submitThreadReply()}}}
                        style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.6,background:"transparent"}}/>
                    </div>
                    <button onClick={submitThreadReply} disabled={!threadReply.trim()||submitting}
                      style={{width:40,height:40,borderRadius:11,background:threadReply.trim()&&!submitting?C.teal:C.border,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
                      {submitting?<div className="spin" style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff"}}/>
                      :<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#0F1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                  </div>
                  <div style={{fontFamily:F.u,fontSize:10,color:C.inkSoft,marginTop:4}}>Press Enter to send</div>
                </div>
              )}

              {ok && <div style={{background:C.greenSoft,border:`1px solid ${C.green}30`,borderRadius:10,padding:"10px",textAlign:"center",marginTop:10}}>
                <span style={{fontFamily:F.u,fontSize:12,color:C.green,fontWeight:600}}>{ok}</span>
              </div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════ PROFILE TAB ════════ */
function ProfileTab() {
  const {doctor, refreshDoctor} = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({bio:doctor?.bio||"",experience:String(doctor?.years_experience||""),phone:doctor?.phone||""})
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState("")
  const set = (k,v)=>setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true)
    await supabase.from("doctors").update({
      bio:form.bio, years_experience:parseInt(form.experience)||0, phone:form.phone, updated_at:new Date().toISOString()
    }).eq("id",doctor?.id)
    await refreshDoctor()
    setSaving(false); setEditing(false)
    setOk("Profile updated!"); setTimeout(()=>setOk(""),3000)
  }

  return (
    <div style={{maxWidth:600}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div style={{fontFamily:F.d,fontSize:28,color:C.ink,fontWeight:600}}>My Profile</div>
        {!editing ? (
          <button onClick={()=>setEditing(true)} style={{padding:"8px 16px",borderRadius:9,background:C.card,border:`1px solid ${C.border}`,fontFamily:F.u,fontSize:12,fontWeight:600,color:C.inkMid}}>Edit Profile</button>
        ) : (
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setEditing(false)} style={{padding:"8px 16px",borderRadius:9,background:"transparent",border:`1px solid ${C.border}`,fontFamily:F.u,fontSize:12,color:C.inkSoft}}>Cancel</button>
            <button onClick={save} style={{padding:"8px 16px",borderRadius:9,background:C.teal,fontFamily:F.u,fontSize:12,fontWeight:600,color:"#0F1117"}}>{saving?"Saving…":"Save Changes"}</button>
          </div>
        )}
      </div>

      <OkMsg msg={ok}/>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:C.tealSoft,border:`1px solid ${C.tealMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.d,fontSize:24,fontWeight:700,color:C.teal}}>
            {doctor?.full_name?.[0]?.toUpperCase()||"D"}
          </div>
          <div>
            <div style={{fontFamily:F.d,fontSize:22,color:C.ink,fontWeight:600}}>{doctor?.full_name}</div>
            <div style={{fontFamily:F.u,fontSize:12,color:C.teal}}>{doctor?.specialty}</div>
          </div>
          <div style={{marginLeft:"auto"}}><StatusBadge status={doctor?.status}/></div>
        </div>

        {[
          {label:"Email",       val:doctor?.email},
          {label:"MDCN Number", val:doctor?.mdcn_number},
        ].map(row=>(
          <div key={row.label} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>{row.label}</span>
            <span style={{fontFamily:F.u,fontSize:12,color:C.ink,fontWeight:500}}>{row.val||"—"}</span>
          </div>
        ))}

        {editing ? (
          <>
            <div style={{paddingTop:16}}>
              <Input label="Phone" placeholder="+234 801 234 5678" value={form.phone} onChange={e=>set("phone",e.target.value)} icon={<span style={{fontSize:13}}>📱</span>}/>
              <Input label="Years of experience" placeholder="e.g. 8" value={form.experience} onChange={e=>set("experience",e.target.value)} type="number"/>
              <div>
                <label style={{display:"block",fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Bio</label>
                <div style={{background:C.surface,border:`1px solid ${C.tealMid}`,borderRadius:12,padding:"13px 16px"}}>
                  <textarea rows={4} value={form.bio} onChange={e=>set("bio",e.target.value.slice(0,300))}
                    style={{width:"100%",fontFamily:F.u,fontSize:13,color:C.ink,lineHeight:1.6,background:"transparent"}}/>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{paddingTop:12}}>
            {doctor?.phone && <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontFamily:F.u,fontSize:12,color:C.inkSoft}}>Phone</span>
              <span style={{fontFamily:F.u,fontSize:12,color:C.ink,fontWeight:500}}>{doctor.phone}</span>
            </div>}
            {doctor?.bio && <div style={{paddingTop:12}}>
              <div style={{fontFamily:F.u,fontSize:10,fontWeight:600,color:C.inkSoft,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Bio</div>
              <p style={{fontFamily:F.u,fontSize:13,color:C.inkMid,lineHeight:1.6}}>{doctor.bio}</p>
            </div>}
          </div>
        )}
      </div>

      {doctor?.status==="pending" && (
        <div style={{background:C.goldSoft,border:`1px solid ${C.gold}30`,borderRadius:14,padding:"16px 18px",display:"flex",gap:12}}>
          <Clock s={16}/>
          <div>
            <div style={{fontFamily:F.u,fontSize:13,fontWeight:600,color:C.gold,marginBottom:4}}>Verification Pending</div>
            <div style={{fontFamily:F.u,fontSize:12,color:C.inkMid,lineHeight:1.5}}>Your MDCN credentials are being verified. You'll be notified by email once approved.</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════ ROUTER ════════ */
function AppInner() {
  const {user, doctor, ready, signOut} = useAuth()
  const [screen,   setScreen]   = useState("welcome")
  const [formData, setFormData] = useState(null)
  const awaitingOTP = useRef(false)
  const go = s => setScreen(s)

  useEffect(()=>{
    if(!ready)return
    if(awaitingOTP.current)return
    if(screen==="otp")return
    if(user) {
      if(!doctor) go("pending")
      else if(doctor.status==="verified") go("dashboard")
      else go("pending")
    } else {
      go("welcome")
    }
  },[user,doctor,ready])

  if(!ready)return <Loader msg="Connecting to Luna Care…"/>

  return <>
    {screen==="welcome"   && <Welcome   onRegister={()=>go("register")} onLogin={()=>go("login")}/>}
    {screen==="register"  && <Register  onBack={()=>{awaitingOTP.current=false;go("welcome")}} onSent={d=>{setFormData(d);awaitingOTP.current=true;go("otp")}}/>}
    {screen==="login"     && <Login     onBack={()=>{awaitingOTP.current=false;go("welcome")}} onSent={d=>{setFormData(d);awaitingOTP.current=true;go("otp")}}/>}
    {screen==="otp"       && <OTP       formData={formData} onBack={()=>{awaitingOTP.current=false;go(formData?.fullName?"register":"login")}} onDone={()=>{awaitingOTP.current=false;go(doctor?.status==="verified"?"dashboard":"pending")}}/>}
    {screen==="pending"   && <Pending   onSignOut={signOut}/>}
    {screen==="dashboard" && <Dashboard/>}
  </>
}

export default function App() {
  return (
    <AuthProvider><AppInner/></AuthProvider>
  )
}
