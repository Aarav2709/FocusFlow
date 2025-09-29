using System.Collections.ObjectModel;
using System.Linq;
using Yeolpumta.Models;
using Yeolpumta.Services;

namespace Yeolpumta.ViewModels
{
    public class NotesViewModel : BaseViewModel
    {
        private readonly NotesService _service;

        public ObservableCollection<Note> Notes { get; } = new();

        public Note? SelectedNote
        {
            get => _selectedNote;
            set
            {
                SetProperty(ref _selectedNote, value);
                if (value != null)
                {
                    EditTitle = value.Title;
                    EditContent = value.Content;
                    EditCategory = value.Category ?? string.Empty;
                }
            }
        }
        private Note? _selectedNote;

        public string EditTitle { get => _editTitle; set => SetProperty(ref _editTitle, value); }
        private string _editTitle = string.Empty;
        public string EditContent { get => _editContent; set => SetProperty(ref _editContent, value); }
        private string _editContent = string.Empty;
        public string EditCategory { get => _editCategory; set => SetProperty(ref _editCategory, value); }
        private string _editCategory = string.Empty;

        public RelayCommand NewCommand { get; }
        public RelayCommand SaveCommand { get; }
        public RelayCommand DeleteCommand { get; }

        public NotesViewModel(NotesService service)
        {
            _service = service;
            NewCommand = new RelayCommand(_ => NewNote());
            SaveCommand = new RelayCommand(_ => SaveNote(), _ => !string.IsNullOrWhiteSpace(EditTitle));
            DeleteCommand = new RelayCommand(_ => DeleteNote(), _ => SelectedNote != null);
            Load();
        }

        private void Load()
        {
            Notes.Clear();
            foreach (var n in _service.GetAll()) Notes.Add(n);
            SelectedNote = Notes.FirstOrDefault();
        }

        private void NewNote()
        {
            SelectedNote = new Note();
            EditTitle = string.Empty;
            EditContent = string.Empty;
            EditCategory = string.Empty;
        }

        private void SaveNote()
        {
            if (SelectedNote == null || SelectedNote.Id == 0)
            {
                var note = new Note { Title = EditTitle, Content = EditContent, Category = string.IsNullOrWhiteSpace(EditCategory) ? null : EditCategory };
                var id = _service.Create(note);
            }
            else
            {
                SelectedNote.Title = EditTitle;
                SelectedNote.Content = EditContent;
                SelectedNote.Category = string.IsNullOrWhiteSpace(EditCategory) ? null : EditCategory;
                _service.Update(SelectedNote);
            }
            Load();
        }

        private void DeleteNote()
        {
            if (SelectedNote != null && SelectedNote.Id != 0)
            {
                _service.Delete(SelectedNote.Id);
                Load();
            }
        }
    }
}
