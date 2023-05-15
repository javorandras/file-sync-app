//
//  MainView.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 03..
//

import SwiftUI

struct MainView: View {
    @State private var LoginSuccess = false
    var body: some View {
        VStack{
            if (!LoginSuccess) {
                    LoginView(isLoginSuccessful: $LoginSuccess)
            } else {
                ContentView()
            }
        }
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
