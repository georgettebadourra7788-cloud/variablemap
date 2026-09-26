import { useState } from 'react';
import { canAdd } from '../config/plans';
import type { Dimension, Item, Project, Variable } from '../types';
import { useProjects } from '../state/ProjectsContext';
import { countItems } from '../lib/factory';
import { REVERSE_OPTIONS } from '../lib/options';
import { Button, Card, SelectField, TextAreaField, TextField } from './ui';
import { ConfirmDialog } from './Dialog';
import { LimitNotice } from './Plans';
import { useToast } from './Toast';

type Pending = { kind: 'dimension'; dim: Dimension } | { kind: 'item'; item: Item } | null;

export function DimensionsItemsEditor({ project, variable }: { project: Project; variable: Variable }) {
  const { addDimension, updateDimension, deleteDimension, addItem, updateItem, deleteItem } = useProjects();
  const toast = useToast();
  const [pending, setPending] = useState<Pending>(null);
  const itemsAtLimit = !canAdd('indicators', countItems(project));
  const pid = project.id;
  const vid = variable.id;

  const onAddItem = (dimensionId: string | null) => {
    const res = addItem(pid, vid, dimensionId);
    if (!res.ok) {
      toast('Indicator/item limit reached.', 'error');
      return;
    }
    requestAnimationFrame(() => document.getElementById(`item-${res.id}`)?.querySelector('input')?.focus());
  };

  const unassigned = variable.items.filter((i) => !i.dimensionId);
  const dimOptions = [{ value: '', label: 'No dimension' }, ...variable.dimensions.map((d) => ({ value: d.id, label: d.name || 'Unnamed dimension' }))];

  const renderItems = (items: Item[]) =>
    items.length === 0 ? (
      <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">No items yet.</p>
    ) : (
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} id={`item-${it.id}`} className="rounded-md border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <TextField label="Item code" value={it.code} onChange={(code) => updateItem(pid, vid, it.id, { code })} placeholder="e.g. AIANX1" maxLength={64} />
              <TextAreaField label="Item text" value={it.text} onChange={(text) => updateItem(pid, vid, it.id, { text })} rows={2} placeholder="Wording as shown to participants" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <SelectField
                label="Dimension"
                value={it.dimensionId ?? ''}
                onChange={(d) => updateItem(pid, vid, it.id, { dimensionId: d || null })}
                options={dimOptions}
              />
              <TextField
                label="Response scale"
                value={it.responseScale}
                onChange={(responseScale) => updateItem(pid, vid, it.id, { responseScale })}
                placeholder="e.g. 1 = Strongly disagree … 5 = Strongly agree"
              />
              <SelectField
                label="Reverse coded"
                value={it.reverseCoded}
                onChange={(reverseCoded) => updateItem(pid, vid, it.id, { reverseCoded })}
                options={REVERSE_OPTIONS}
                hint="Set this yourself — it is never decided automatically."
              />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <TextField
                className="flex-1"
                label="Item coding notes"
                value={it.codingNotes}
                onChange={(codingNotes) => updateItem(pid, vid, it.id, { codingNotes })}
                placeholder="Optional"
              />
              <Button
                variant="ghost"
                size="sm"
                className="self-end text-red-700 hover:bg-red-50"
                onClick={() => (it.code || it.text ? setPending({ kind: 'item', item: it }) : deleteItem(pid, vid, it.id))}
              >
                Remove item
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="space-y-4">
      {itemsAtLimit && <LimitNotice kind="indicators" />}

      {variable.dimensions.map((d) => {
        const items = variable.items.filter((i) => i.dimensionId === d.id);
        return (
          <Card key={d.id} className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
              <TextField label="Dimension name" value={d.name} onChange={(name) => updateDimension(pid, vid, d.id, { name })} placeholder="e.g. Learning anxiety" />
              <TextField
                label="Description"
                value={d.description}
                onChange={(description) => updateDimension(pid, vid, d.id, { description })}
                placeholder="What this dimension captures"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">
                Items in this dimension <span className="font-normal text-slate-500">({items.length})</span>
              </h4>
              <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setPending({ kind: 'dimension', dim: d })}>
                Remove dimension
              </Button>
            </div>
            <div className="mt-2">{renderItems(items)}</div>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => onAddItem(d.id)} disabled={itemsAtLimit}>
              + Add item to {d.name || 'this dimension'}
            </Button>
          </Card>
        );
      })}

      {(variable.dimensions.length === 0 || unassigned.length > 0) && (
        <Card className="p-4 sm:p-5">
          <h4 className="text-sm font-semibold text-slate-700">
            {variable.dimensions.length === 0 ? 'Indicators/items' : 'Items without a dimension'}{' '}
            <span className="font-normal text-slate-500">({unassigned.length})</span>
          </h4>
          {variable.dimensions.length === 0 && (
            <p className="mt-1 text-xs text-slate-500">Dimensions are optional. Add items directly, or add dimensions to group them.</p>
          )}
          <div className="mt-2">{renderItems(unassigned)}</div>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => onAddItem(null)} disabled={itemsAtLimit}>
            + Add item
          </Button>
        </Card>
      )}

      <Button variant="secondary" onClick={() => addDimension(pid, vid)}>
        + Add dimension
      </Button>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'dimension' ? 'Remove this dimension?' : 'Remove this item?'}
        confirmLabel={pending?.kind === 'dimension' ? 'Remove dimension' : 'Remove item'}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind === 'dimension') deleteDimension(pid, vid, pending.dim.id);
          if (pending?.kind === 'item') deleteItem(pid, vid, pending.item.id);
          setPending(null);
        }}
      >
        {pending?.kind === 'dimension' ? (
          <p>
            The dimension “{pending.dim.name || 'Unnamed dimension'}” will be removed. Its items are <strong>kept</strong> and moved to “Items without a
            dimension”.
          </p>
        ) : (
          <p>
            Item <strong>{pending?.kind === 'item' ? pending.item.code || pending.item.text.slice(0, 60) : ''}</strong> will be permanently removed.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
