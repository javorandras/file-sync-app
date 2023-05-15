//
//  ContentView.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import SwiftUI

struct ContentView: View {
    @State private var presentAlert = false
    @State private var enteredText = ""

    var body: some View {
            Button("Send message") {
                presentAlert = true
            }
            .alert("Login", isPresented: $presentAlert, actions: {
                TextField("Enter your message here...", text: $enteredText)
                Button("Send") {
                    submitText();
                }
                Button("Cancel", role: .cancel, action: {})
            }, message: {
                Text("Please enter your message")
            })
        }
    
    func submitText() {
        let message = Message(message: enteredText);
        message.sendText()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
