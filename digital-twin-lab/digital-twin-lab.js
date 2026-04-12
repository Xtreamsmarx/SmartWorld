const cards = document.querySelectorAll('.card');
for (const card of cards) {
  card.addEventListener('pointerenter', () => {
    card.style.borderColor = 'rgba(255,255,255,0.5)';
  });
  card.addEventListener('pointerleave', () => {
    card.style.borderColor = '';
  });
}
