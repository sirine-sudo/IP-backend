const updateUserRole = asyncHandler(async (userId) => {
    const { rows } = await pool.query("SELECT COUNT(*) FROM ips WHERE owner_id = $1", [userId]);
    
    if (parseInt(rows[0].count) > 0) {
        await pool.query("UPDATE users SET role = 'ip_owner' WHERE id = $1 AND role = 'simple_user'", [userId]);
    }
});
const uploadIP = asyncHandler(async (req, res) => {
    const { ipName, metadata } = req.body;
    const userId = req.user.id;

    if (!ipName || !metadata) {
        return res.status(400).json({ message: "IP Name and Metadata are required" });
    }

    // Insert new IP
    await pool.query("INSERT INTO ips (name, metadata, owner_id) VALUES ($1, $2, $3)", [ipName, metadata, userId]);

    // Update role if needed
    await updateUserRole(userId);

    res.status(201).json({ message: "IP uploaded successfully!" });
});
