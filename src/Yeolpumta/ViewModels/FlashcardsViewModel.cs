using System.Collections.ObjectModel;
using System.Linq;
using Yeolpumta.Models;
using Yeolpumta.Services;

namespace Yeolpumta.ViewModels
{
    public class FlashcardsViewModel : BaseViewModel
    {
        private readonly FlashcardsService _service;
        public ObservableCollection<Flashcard> Cards { get; } = new();

        public Flashcard? Selected { get => _selected; set { SetProperty(ref _selected, value); LoadEditor(); } }
        private Flashcard? _selected;

        public string EditFront { get => _front; set => SetProperty(ref _front, value); }
        private string _front = string.Empty;
        public string EditBack { get => _back; set => SetProperty(ref _back, value); }
        private string _back = string.Empty;
        public string EditDeck { get => _deck; set => SetProperty(ref _deck, value); }
        private string _deck = string.Empty;

        public RelayCommand NewCommand { get; }
        public RelayCommand SaveCommand { get; }
        public RelayCommand DeleteCommand { get; }
        public RelayCommand MarkCorrectCommand { get; }
        public RelayCommand MarkWrongCommand { get; }

        public FlashcardsViewModel(FlashcardsService service)
        {
            _service = service;
            NewCommand = new RelayCommand(_ => NewCard());
            SaveCommand = new RelayCommand(_ => SaveCard(), _ => !string.IsNullOrWhiteSpace(EditFront) && !string.IsNullOrWhiteSpace(EditBack));
            DeleteCommand = new RelayCommand(_ => DeleteCard(), _ => Selected != null && Selected.Id != 0);
            MarkCorrectCommand = new RelayCommand(_ => Mark(true), _ => Selected != null && Selected.Id != 0);
            MarkWrongCommand = new RelayCommand(_ => Mark(false), _ => Selected != null && Selected.Id != 0);
            Load();
        }

        private void Load()
        {
            Cards.Clear();
            foreach (var c in _service.GetAll()) Cards.Add(c);
            Selected = Cards.FirstOrDefault();
        }

        private void LoadEditor()
        {
            if (Selected != null)
            {
                EditFront = Selected.Front;
                EditBack = Selected.Back;
                EditDeck = Selected.Deck ?? string.Empty;
            }
        }

        private void NewCard()
        {
            Selected = new Flashcard();
            EditFront = string.Empty;
            EditBack = string.Empty;
            EditDeck = string.Empty;
        }

        private void SaveCard()
        {
            if (Selected == null || Selected.Id == 0)
            {
                var card = new Flashcard { Front = EditFront, Back = EditBack, Deck = string.IsNullOrWhiteSpace(EditDeck) ? null : EditDeck };
                _service.Create(card);
            }
            else
            {
                Selected.Front = EditFront;
                Selected.Back = EditBack;
                Selected.Deck = string.IsNullOrWhiteSpace(EditDeck) ? null : EditDeck;
                _service.Update(Selected);
            }
            Load();
        }

        private void DeleteCard()
        {
            if (Selected != null && Selected.Id != 0)
            {
                _service.Delete(Selected.Id);
                Load();
            }
        }

        private void Mark(bool correct)
        {
            if (Selected != null && Selected.Id != 0)
            {
                _service.UpdateStreak(Selected.Id, correct);
                Load();
            }
        }
    }
}
