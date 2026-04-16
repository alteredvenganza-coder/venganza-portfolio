import { supabase } from './supabase';

// ── camelCase ↔ snake_case ─────────────────────────────────────────────────────

function clientFromDb(row) {
  return {
    id:        row.id,
    name:      row.name,
    brand:     row.brand,
    email:     row.email,
    phone:     row.phone,
    language:  row.language,
    notes:     row.notes,
    createdAt: row.created_at,
  };
}

function clientToDb(c) {
  const row = {};
  if ('name'     in c) row.name     = c.name;
  if ('brand'    in c) row.brand    = c.brand;
  if ('email'    in c) row.email    = c.email;
  if ('phone'    in c) row.phone    = c.phone;
  if ('language' in c) row.language = c.language;
  if ('notes'    in c) row.notes    = c.notes;
  return row;
}

function projectFromDb(row) {
  return {
    id:            row.id,
    clientId:      row.client_id,
    title:         row.title,
    description:   row.description,
    type:          row.type,
    stage:         row.stage,
    isPaused:      row.is_paused,
    pausedReason:  row.paused_reason,
    deadline:      row.deadline,
    price:         row.price,
    paidAmount:    row.paid_amount    ?? null,
    contractSent:  row.contract_sent  ?? false,
    retainerFee:   row.retainer_fee   ?? null,
    salesCount:    row.sales_count    ?? null,
    paymentStatus: row.payment_status,
    nextAction:    row.next_action,
    missingInfo:   row.missing_info,
    tasks:         row.tasks        ?? [],
    files:         row.files        ?? [],
    brief:         row.brief        ?? {},
    coverImage:    row.cover_image  ?? null,
    completedAt:   row.completed_at ?? null,
    activity:      row.activity     ?? [],
    createdAt:     row.created_at,
  };
}

function projectToDb(p) {
  const row = {};
  if ('clientId'      in p) row.client_id      = p.clientId || null;
  if ('title'         in p) row.title          = p.title;
  if ('description'   in p) row.description    = p.description;
  if ('type'          in p) row.type           = p.type;
  if ('stage'         in p) row.stage          = p.stage;
  if ('isPaused'      in p) row.is_paused      = p.isPaused;
  if ('pausedReason'  in p) row.paused_reason  = p.pausedReason;
  if ('deadline'      in p) row.deadline       = p.deadline || null;
  if ('price'         in p) row.price          = p.price ? Number(p.price) : null;
  if ('paidAmount'    in p) row.paid_amount    = p.paidAmount ? Number(p.paidAmount) : null;
  if ('contractSent'  in p) row.contract_sent  = Boolean(p.contractSent);
  if ('retainerFee'   in p) row.retainer_fee   = p.retainerFee ? Number(p.retainerFee) : null;
  if ('salesCount'    in p) row.sales_count    = p.salesCount  ? Number(p.salesCount)  : null;
  if ('paymentStatus' in p) row.payment_status = p.paymentStatus;
  if ('nextAction'    in p) row.next_action    = p.nextAction;
  if ('missingInfo'   in p) row.missing_info   = p.missingInfo;
  if ('tasks'         in p) row.tasks          = p.tasks  ?? [];
  if ('files'         in p) row.files          = p.files  ?? [];
  if ('brief'         in p) row.brief          = p.brief  ?? {};
  if ('coverImage'    in p) row.cover_image    = p.coverImage  ?? null;
  if ('completedAt'   in p) row.completed_at  = p.completedAt ?? null;
  if ('activity'      in p) row.activity      = p.activity    ?? [];
  return row;
}

// ── Clients ───────────────────────────────────────────────────────────────────

export async function fetchClients(userId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(clientFromDb);
}

export async function insertClient(userId, data) {
  const { data: row, error } = await supabase
    .from('clients')
    .insert({ user_id: userId, ...clientToDb(data) })
    .select()
    .single();
  if (error) throw error;
  return clientFromDb(row);
}

export async function patchClient(id, patch) {
  const { error } = await supabase
    .from('clients')
    .update(clientToDb(patch))
    .eq('id', id);
  if (error) throw error;
}

export async function removeClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function fetchProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(projectFromDb);
}

export async function insertProject(userId, data) {
  const { data: row, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, ...projectToDb(data) })
    .select()
    .single();
  if (error) throw error;
  return projectFromDb(row);
}

export async function patchProject(id, patch) {
  const { error } = await supabase
    .from('projects')
    .update(projectToDb(patch))
    .eq('id', id);
  if (error) throw error;
}

export async function removeProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ── Calendar Tasks ───────────────────────────────────────────────────────────

function calTaskFromDb(row) {
  return {
    id:              row.id,
    userId:          row.user_id,
    title:           row.title,
    description:     row.description,
    date:            row.date,
    timeStart:       row.time_start,
    timeEnd:         row.time_end,
    color:           row.color,
    isDone:          row.is_done,
    reminderMinutes: row.reminder_minutes,
    createdAt:       row.created_at,
  };
}

function calTaskToDb(t) {
  const row = {};
  if ('title'           in t) row.title            = t.title;
  if ('description'     in t) row.description      = t.description;
  if ('date'            in t) row.date             = t.date;
  if ('timeStart'       in t) row.time_start       = t.timeStart ?? null;
  if ('timeEnd'         in t) row.time_end         = t.timeEnd ?? null;
  if ('color'           in t) row.color            = t.color;
  if ('isDone'          in t) row.is_done          = t.isDone;
  if ('reminderMinutes' in t) row.reminder_minutes = t.reminderMinutes ?? null;
  return row;
}

export async function fetchCalendarTasks(userId) {
  const { data, error } = await supabase
    .from('calendar_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data.map(calTaskFromDb);
}

export async function insertCalendarTask(userId, data) {
  const { data: row, error } = await supabase
    .from('calendar_tasks')
    .insert({ user_id: userId, ...calTaskToDb(data) })
    .select()
    .single();
  if (error) throw error;
  return calTaskFromDb(row);
}

export async function patchCalendarTask(id, patch) {
  const { error } = await supabase
    .from('calendar_tasks')
    .update(calTaskToDb(patch))
    .eq('id', id);
  if (error) throw error;
}

export async function removeCalendarTask(id) {
  const { error } = await supabase.from('calendar_tasks').delete().eq('id', id);
  if (error) throw error;
}

// ── Storage — project files ───────────────────────────────────────────────────

export async function uploadProjectFile(projectId, file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${projectId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('project-files').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('project-files').getPublicUrl(path);

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url: data.publicUrl,
    path
  };
}

export async function createSharedLink(path, expiresIn = 60 * 60 * 24 * 7) {
  const { data, error } = await supabase.storage
    .from('project-files')
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteProjectFile(storagePath) {
  const { error } = await supabase.storage.from('project-files').remove([storagePath]);
  if (error) throw error;
}

// ── Deliveries (link pubblici per i clienti) ──────────────────────────────────

export async function createDelivery({ projectId, title, files, message, bgImages = [], expiresInDays = 7 }) {
  const expires_at = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('deliveries')
    .insert({ project_id: projectId, title, files, message, bg_images: bgImages, expires_at })
    .select()
    .single();
  if (error) throw error;
  return data; // { token, title, files, expires_at, ... }
}

export async function getDelivery(token) {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('token', token)
    .single();
  if (error) throw error;
  return data;
}

// ── Standalone transfers (project_id is null) ────────────────────────────────

export async function fetchTransfers() {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .is('project_id', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
