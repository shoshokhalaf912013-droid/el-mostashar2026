// src/pages/AdminPayments.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Box, Typography, Paper, Button, Grid, Avatar } from "@mui/material";

export default function AdminPayments() {
  const [items, setItems] = useState([]);
  const CF_URL = "https://us-central1-YOUR_PROJECT.cloudfunctions.net/sendWhatsapp"; // غيّر للـ function الفعلية

  useEffect(() => {
    const fetchPending = async () => {
      const snap = await getDocs(collection(db, "users"));
      const pending = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.subscriptionStatus === "verification") {
          pending.push({ id: d.id, ...data });
        }
      });
      setItems(pending);
    };
    fetchPending();
  }, []);

  const approve = async (u) => {
    const expiration = new Date(Date.now() + 30*24*60*60*1000);
    await updateDoc(doc(db, "users", u.id), {
      subscriptionStatus: "active",
      subscriptionEnd: expiration
    });

    // إرسال واتساب عبر Cloud Function
    await fetch(CF_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        phone: u.phone,
        message: `🎉 تم تفعيل اشتراكك لمدة 30 يومًا. شكراً لك!`
      })
    });

    setItems(items.filter(i => i.id !== u.id));
    alert("تم التفعيل وإرسال رسالة للطالب");
  };

  const reject = async (u) => {
    await updateDoc(doc(db, "users", u.id), {
      subscriptionStatus: "pending",
      receiptUrl: ""
    });

    await fetch(CF_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        phone: u.phone,
        message: `❌ تم رفض الإيصال. الرجاء إعادة الإرسال بصيغة واضحة أو التواصل معنا.`
      })
    });

    setItems(items.filter(i => i.id !== u.id));
    alert("تم الرفض وإرسال إخطار");
  };

  return (
    <Box p={3}>
      <Typography variant="h5" color="warning.main" mb={2}>🔎 مراجعة إيصالات الدفع</Typography>

      {items.length === 0 && <Typography>لا توجد إيصالات للمراجعة.</Typography>}

      <Grid container spacing={2}>
        {items.map(u => (
          <Grid key={u.id} item xs={12} md={6}>
            <Paper sx={{p:2, display:"flex", gap:2, alignItems:"center"}} elevation={2}>
              <Avatar sx={{width:80, height:80}} src={u.receiptUrl} variant="rounded"/>
              <Box sx={{flex:1}}>
                <Typography variant="subtitle1">{u.fullName} — {u.phone}</Typography>
                <Typography variant="body2" color="text.secondary">كود: {u.paymentCode}</Typography>
                <Box mt={1} sx={{display:"flex", gap:1}}>
                  <Button size="small" variant="contained" color="success" onClick={() => approve(u)}>قبول</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => reject(u)}>رفض</Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
