alter table public.admin_roles
 add constraint admin_roles_pkey primary key (user_id, institution_id, role);

drop policy if exists "users_read_own_bookmarks" on public.bookmarks;
drop policy if exists "users_manage_own_bookmarks" on public.bookmarks;

create policy "users_manage_own_bookmarks" on public.bookmarks
 for all to authenticated
 using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()));
