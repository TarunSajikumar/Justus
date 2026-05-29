import { Router } from "express";
import { supabase } from "../config/supabase";

const router = Router();

router.get("/", async (_, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;