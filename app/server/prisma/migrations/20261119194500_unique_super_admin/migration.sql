-- At most one user may have the SUPER_ADMIN role.
-- Do not auto-demote existing accounts on conflicting data.
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM "User" WHERE "role" = 'SUPER_ADMIN') > 1 THEN
        RAISE EXCEPTION 'Multiple SUPER_ADMIN users exist; resolve duplicates before applying this migration';
    END IF;
END
$$;

CREATE UNIQUE INDEX "User_single_super_admin"
    ON "User" ("role")
    WHERE ("role" = 'SUPER_ADMIN'::"Role");
