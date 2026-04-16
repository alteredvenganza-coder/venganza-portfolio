import NoteCard from './NoteCard';
import HeadingCard from './HeadingCard';
import ImageCard from './ImageCard';
import LinkCard from './LinkCard';
import TodoCard from './TodoCard';
import BoardCard from './BoardCard';
import BudgetCard from './BudgetCard';

export const CARD_COMPONENTS = {
  note:    NoteCard,
  heading: HeadingCard,
  image:   ImageCard,
  link:    LinkCard,
  todo:    TodoCard,
  board:   BoardCard,
  budget:  BudgetCard,
};

export function renderCard(card, ctx) {
  const Comp = CARD_COMPONENTS[card.type];
  if (!Comp) {
    return (
      <div key={card.id} style={{ position:'absolute', left:card.x, top:card.y, padding:8,
        background:'#fee', border:'1px solid #f99', borderRadius:6, fontSize:11 }}>
        Unknown card type: {card.type}
      </div>
    );
  }
  return <Comp key={card.id} card={card} {...ctx} />;
}
