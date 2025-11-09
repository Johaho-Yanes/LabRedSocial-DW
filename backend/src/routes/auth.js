import express from "express";
import passport from "passport";

const router = express.Router();

// Inicia autenticación con Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback de Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.FRONTEND_URL,
  }),
  (req, res) => {
    const token = req.user?.token;
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
     
    }
    console.log("antes de redirigir con el token");
    // Si el usuario necesita completar perfil (p.ej. bio vacío) indicarlo al frontend
    const needsSetup = !req.user?.bio || req.user.bio.trim() === '';
    const redirectBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const setupParam = needsSetup ? '&setup=true' : '';
    
    // Redirige al frontend con el token JWT y el usuario
    const userData = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      bio: req.user.bio,
      avatar: req.user.avatar
    };
    
    // Redirige al frontend con los parámetros necesarios
    res.redirect(
      `${redirectBase}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}${setupParam}`
    );  }
);

export default router;
