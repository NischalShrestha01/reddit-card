// Change username on click
document.querySelectorAll('.username').forEach(username => {
  username.addEventListener('click', () => {
    const newName = prompt('Enter new username:');
    if (newName && newName.trim() !== '') {
      username.textContent = newName;
    }
  });
});

// Change profile picture on click
document.querySelectorAll('.pfp').forEach(pfp => {
  pfp.addEventListener('click', () => {
    const newUrl = prompt('Enter image URL for new profile picture:');
    if (newUrl && newUrl.trim() !== '') {
      pfp.src = newUrl;
    }
  });
});
