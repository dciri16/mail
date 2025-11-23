document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#data-error').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

    document.querySelector('#compose-form').onsubmit = (event) => {
    event.preventDefault();
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST', 
    body: JSON.stringify({ recipients, subject, body }),
    headers: {
      'Content-Type': 'application/json'
    }
    })
  .then(response => response.json())
  .then(data => { 
    if (data.error) {
      document.querySelector('#data-error').innerHTML = data.error
      document.querySelector('#data.error').style.display = 'block';
    }
    if (data.message) {
      load_mailbox('sent')
    }
  })
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#single-emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#data-error').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
  fetch(`/emails/${mailbox}`, {
    method: 'GET', 
  })
  .then(response => response.json())
  .then(data => {
    data.forEach(email =>{
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${email.sender}</strong>,
      ${email.subject},
      ${email.timestamp}
      `;
    div.addEventListener('click', () => load_email(email.id));
    document.querySelector('#emails-view').append(div);    
    if (email.read) {
      div.className = 'email-read';
    } else {
      div.className = 'email-unread';
    }})})
}

function load_email(email_id) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-emails-view').style.display = 'block';
      fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(data => {
          let div = document.querySelector('#single-emails-view');
          div.innerHTML = `
          <button class="btn btn-sm btn-outline-primary" id="reply" style="float:right">Reply</button>
          <p><strong>From: </strong>${data.sender}</p>
          <p><strong>To: </strong>${data.recipients}</p>
          <p><strong>Subject: </strong>${data.subject}</p>
          <p><strong>Timestamp: </strong>${data.timestamp}</p>
          <br>
          <p>${data.body}</p>
          <br>
          `;

          fetch(`/emails/${email_id}`, {
            method: 'PUT', 
            body: JSON.stringify({ read : true }),
          })

          if (data.archived == true){
            div.innerHTML += `
            <button class="btn btn-sm btn-outline-primary" id="unarchive" style="float:right">Unarchive</button>
            `
          } else {
           div.innerHTML +=`
            <button class="btn btn-sm btn-outline-primary" id="archive" style="float:right">Archive</button>
            `
          } 
          const ArchBtn = document.querySelector('#archive') || document.querySelector('#unarchive');
          ArchBtn.addEventListener('click', () => {
          fetch(`/emails/${email_id}`, {
              method: 'PUT', 
              body: JSON.stringify({ archived: !data.archived }),
              })    
          .then(() => load_mailbox('inbox'))
          });

          document.querySelector('#reply').addEventListener('click', () => {
              compose_email();
              document.querySelector('#compose-recipients').value = data.sender;
              document.querySelector('#compose-subject').value = `RE: ${data.subject}`;
              document.querySelector('#compose-body').value = `
              \n\nOn ${data.timestamp} ${data.sender} wrote:\n
              ${data.body}\n\n
                `;
              }
          )})
        } 
    
